import pandas as pd
import pymysql

def DatabaseConnection():
    host="dublinbikes-rse.c3hjycqhuxxq.eu-west-1.rds.amazonaws.com"
    port=3306
    dbname="DublinBikes"
    user="Group8"
    password="COMP30670"

    conn = pymysql.connect(host, user=user,port=port,
                               passwd=password, db=dbname)
    
    station_list = pd.read_sql('select StationInfocol from StationInfo;', con=conn) 

    return conn, station_list