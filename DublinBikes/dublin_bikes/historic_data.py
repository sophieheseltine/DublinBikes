'''
This file grabs data every two mins from JCD and stores it in a CSV file.
This will be changed to an Amazon RDS 
'''
import scraper as scr
import time
from sqlalchemy import create_engine
import pandas as pd

city = 'Dublin'
engine = create_engine("mysql+pymysql://Group8:COMP30670@dublinbikes-rse.c3hjycqhuxxq.eu-west-1.rds.amazonaws.com:3306/DublinBikes")
conn = engine.connect()

#passing into scrapper functions
dataframe = scr.information(city)
#Appends the real time info in the UserTends table in the Amazon RDS database every 5 mins
dataframe.to_sql(name='UserTrends',con=conn, if_exists='append', index=False)

conn.close()
