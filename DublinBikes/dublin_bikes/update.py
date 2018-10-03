'''
This file grabs data every two mins from JCD and stores it in an amazon RDS
'''
import scraper as scr
import time
from sqlalchemy import create_engine
import pandas as pd

city = 'Dublin'
#Assigning the engine variable values
engine = create_engine("mysql+pymysql://Group8:COMP30670@dublinbikes-rse.c3hjycqhuxxq.eu-west-1.rds.amazonaws.com:3306/DublinBikes")
#Creating the connection with the database
conn = engine.connect()
while True:
    #passing into scrapper functions
    dataframe = scr.information(city)
    #Replaces the real time info in the RealTime table in the Amazon RDS database every 2 mins
    dataframe.to_sql(name='RealTime',con=conn, if_exists='replace', index=False)
    print('done')
    time.sleep(2*60)
conn.close()
