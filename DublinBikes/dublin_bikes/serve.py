from flask import Flask, render_template, jsonify, g, request, flash
import json
import sqlite3
from pandas.tests.computation.test_eval import engine
from sqlalchemy import create_engine
from functools import lru_cache
import functools
import csv
import pickle
import pandas as pd
import numpy as np
from sklearn.externals import joblib
from pandas.core.datetools import day
from pickle import Unpickler


app = Flask(__name__, static_url_path='')
#app.config.from_object('config')
'''
rds_host = "dublinbikes-rse.c3hjycqhuxxq.eu-west-1.rds.amazonaws.com"
name = "Group8"
password = "COMP30670"
db_name = "DublinBikes"
port = 3306
'''

def connect_to_database():
    engine = create_engine("mysql+pymysql://Group8:COMP30670@dublinbikes-rse.c3hjycqhuxxq.eu-west-1.rds.amazonaws.com:3306/DublinBikes")
    conn = engine.connect()
    return conn
   

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
      db.close() 


#Simply serves "static/index.html"
@app.route('/')
def root():
    return render_template('index.html')

@app.errorhandler(404)
def page_not_found(error):
    return render_template('404.html'), 404

@app.route('/stations')
@functools.lru_cache(maxsize=128, typed=False)
def getStations():
    #Creating the connection with the database
    conn = connect_to_database()
    sql = "SELECT * FROM StationInfo;"
    stations = []
    rows = conn.execute(sql).fetchall()
    for row in rows:
        stations.append(dict(row))
    return jsonify(stations)

@app.route('/stationDetails')
def station_details():
    conn = connect_to_database()
    sql = "SELECT * FROM RealTime, StationInfo WHERE RealTime.name = StationInfo.StationIName"
    station_info = []
    rows = conn.execute(sql).fetchall()
    for row in rows:
        station_info.append(dict(row))
    return jsonify(station_info)

@app.route('/forecast')
def getForecast():
    #Creating the connection with the database
    conn = connect_to_database()
    sql = "SELECT * FROM WeatherForecast;"
    weather = []
    rows = conn.execute(sql).fetchall()
    for row in rows:
        weather.append(dict(row))
    return jsonify(weather)

@app.route('/weather')
def getWeather():
    #Creating the connection with the database
    conn = connect_to_database()
    sql = "SELECT * FROM WeatherData;"
    weatherData = []
    rows = conn.execute(sql).fetchall()
    for row in rows:
        weatherData.append(dict(row))
    return jsonify(weatherData)

@app.route('/historical')
@functools.lru_cache(maxsize=128, typed=False)
def getHistorical():
    conn = connect_to_database()
    sql = "SELECT * FROM UserTrends;"
    historicalData = []
    rows = conn.execute(sql).fetchall()
    for row in rows:
        historicalData.append(dict(row))
    return jsonify(historicalData)


@app.route('/json')
@functools.lru_cache(maxsize=128, typed=False)
def getChartJson():
    csvfile = open('../dublin_bikes/Analysis/dfGroupedFinal.csv')
    jsonlist = []
    reader = csv.reader(csvfile)
    for row in reader:
        jsonlist.append(row)
    return jsonify(jsonlist)

app.secret_key = 'some_secret'

@app.route('/getModel', methods=['POST'])
def get_model():
    #Grabbing time, rain, and day from form
    data = str(request.get_data())
    start = data.find('day=')+4
    end = data.find('+', start)
    day = data[start:end]
    start = data.find('+')+1
    end = data.find("&time", start)
    date = str(data[start:end])
    start = data.find('time=')+5
    end = data.find('&station', start)
    time = int(data[start:end])
    start = data.find('station=')+8
    end = data.find("'", start)
    stationID = data[start:end]
    if 0 < time < 4:
        time = '03'
    elif 3 < time < 7:
        time = '06'
    elif 6 < time < 10:
        time = '09'
    elif 9 < time < 13:
        time = '12'
    elif 12 < time < 16:
        time = '15'
    elif 15 < time < 19:
        time = '18'
    elif 18 < time < 22:
        time = '21'
    else:
        time = '00'
    
    #Counting how many stations for the model parameter
    conn = connect_to_database()
    sql = "SELECT COUNT(*) FROM StationInfo;"
    number = conn.execute(sql).fetchall()
    #Creating an array of 0 with length equaling number of stations
    stationParams = [0]*number[0][0]
    conn = connect_to_database()
    seq=(date, time)
    x=" "
    x = x.join(seq)
    newsql =  "SELECT * FROM WeatherPredictor WHERE dt_txt LIKE '%"
    newsql += date
    newsql+="%';"
    weather = conn.execute(newsql).fetchall()
    main = ""
    for i in range(0, len(weather)):
        if weather[i][0][8:13] == x:
            main = weather[i][1]
            break;
    if main == 'Rain':
        rainBin = 1
    else:
        rainBin = 0
    #grabbing value in StationID
    #Setting this station value to 1 for model query
    stationParams[int(stationID)-1] = 1
    dayBin = [0,0]
    if day == 'Saturday' or day =='Sunday':
        dayBin[1] = 1
    else:
        dayBin[0] = 1
    #loading pkl file
    model = joblib.load('../dublin_bikes/Analysis/finalized_model.pkl')
    stationParams.insert(0,int(time))
    stationParams.insert(1,int(dayBin[0]))
    stationParams.insert(2,int(dayBin[1]))
    stationParams.insert(3,rainBin)
    #This line is in here because 104 stations + day + time + weather gives 107 - model takes 108 parameters??
    #predicting model
    prediction = model.predict([stationParams])
    result = str(int(round(prediction[0])))
    jsonlist = []
    jsonlist.append({"weather":main})
    jsonlist.append({"station":stationID})
    jsonlist.append({"date":date})
    jsonlist.append({"time":time})
    jsonlist.append({"day":day})
    jsonlist.append({"result":result})
    if day and time and stationID:
        return jsonify(jsonlist)
    return jsonify({'error':'Some data missing - please try agian!'})

if __name__ == '__main__':
    #clf = joblib.load('../dublin_bikes/Analysis/finalized_model.pkl')
    #model_columns = joblib.load('../dublin_bikes/Analysis/model_columns.pkl')
    app.run(host='0.0.0.0',debug=True) 
