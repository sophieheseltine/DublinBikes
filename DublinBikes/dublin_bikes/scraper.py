'''
Modules to deal with the API
'''
from six.moves.urllib.request import urlopen
import json
import pandas as pd
from datetime import datetime
from pandas_datareader import data
import urllib.request
import requests

#Defining variables
key = 'a1e7a7f9c0fbebd9b73029d8d2ca15bac7c27027'
base = 'https://api.jcdecaux.com/vls/v1/'
def query_API(url):
    '''
    function for interrogating the API
    '''
    #send a query to the API and decode the bytes it returns
    query = urlopen(url).read().decode('utf-8')
    #return the obtained string as a dictionary
    return json.loads(query)

def stations_list(city):
    '''
    A function that interrogates the API for all the stations in a given city
    '''
    #specify the url to send to the API, in which we specify the city name and the API key
    url = base + 'stations/?contract={0}&apiKey={1}'.format(city, key)
    #send to url to the API to get the data we want
    data = query_API(url)
    return data

def timestamp_to_ISO(timestamp):
    '''
    Function to convert to yyyy-mm-dd hh:mm:ss format
    '''
    moment = datetime.fromtimestamp(timestamp / 1000)
    return moment.time().isoformat()

def information(city):
    '''
    funtion takes a city as a parameter and returns it a dataframe. 
    '''
    #Collect JSON Data
    data = stations_list(city)
    #converting to a dataframe
    df = pd.DataFrame(data)
    #extracting embedded positions
    positions = df.position.apply(pd.Series)
    df['latitude'] = positions['lat']
    df['longitude'] = positions['lng']
    #making timestamps human readable
    df['last_update'] = df['last_update'].apply(timestamp_to_ISO)
    #only return the columns that we need.
    return df[['available_bikes', 'last_update', 'name', 'latitude',
               'longitude', 'available_bike_stands', 'bike_stands',
               'status']]
    
    
    
