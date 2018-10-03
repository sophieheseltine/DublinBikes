from sqlalchemy import create_engine
from six.moves.urllib.request import urlopen
import json
import pandas as pd
from pandas.io.json import json_normalize
import time

def get_data():
    """Get weather data from openweathermap"""
    #send a query to the API and decode the bytes it returns
    query = urlopen("http://api.openweathermap.org/data/2.5/weather?id=7778677&units=metric&APPID=6986e64d5d176d1782825a12f2677fe4").read().decode('utf-8')
    #return the obtained string as a dictionary
    data = json.loads(query)
    df1 = pd.DataFrame(data['weather'])
    #main = df.main.apply(pd.Series)
    #converting to a dataframe
    df = pd.DataFrame.from_dict(json_normalize(data), orient='columns')
    df = df.drop('weather', 1)
    df.rename(columns={'main.temp': 'temp'}, inplace=True)
    temp = df['temp']
    df['temp'] = temp.round()
    df.rename(columns={'main.temp_max': 'temp_max'}, inplace=True)
    df.rename(columns={'main.temp_min': 'temp_min'}, inplace=True)
    df.rename(columns={'wind.speed': 'wind_speed'}, inplace=True)
    #df['last_update'] = timestamp_to_ISO(df['dt'])
    dataframe = pd.concat([df, df1], axis=1)
    return dataframe[['temp', 'temp_max', 'temp_min', 'wind_speed', 'description', 'icon', 'main']]

def save_data_to_db(dataframe):
    #Assigning the engine variable values
    engine = create_engine("mysql+pymysql://Group8:COMP30670@dublinbikes-rse.c3hjycqhuxxq.eu-west-1.rds.amazonaws.com:3306/DublinBikes")
    #Creating the connection with the database
    conn = engine.connect()
    #passing into scrapper functions
    #Replaces the real time info in the RealTime table in the Amazon RDS database every 2 mins
    dataframe.to_sql(name='WeatherData',con=conn, if_exists='replace', index=False)
    conn.close()

while True:
    data = get_data()
    save_data_to_db(data)
    print('weather scraper done')
    time.sleep(60*60)

