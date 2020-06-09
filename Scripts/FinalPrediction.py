import pandas as pd
import numpy as np
import os
import joblib
import sys

originalData = pd.read_csv("D:/train-data.csv")
trainedData = pd.read_csv("D:/trained.csv")
trainedData.drop(trainedData.columns[0], axis=1, inplace=True)
trainedData.drop('Price',axis=1,inplace=True)

carList = str(sys.argv[1]).split(',')

carName = carList[0] + " " + carList[1]

intYear = int(carList[4], 10)
carList[4] = intYear

intKm = int(carList[5], 10)
carList[5] = intKm

for i in range(originalData.shape[0]):
   if originalData["Name"][i].upper() == carName.upper():
       seat = originalData['Seats'][i]
       mlg = originalData['Mileage'][i]
       eng = originalData['Engine'][i]
       power = originalData['Power'][i]
       fuel = originalData['Fuel_Type'][i]
       owner = originalData['Owner_Type'][i]
       trans = originalData['Transmission'][i]
       
data_list=[]
data_list.append(carList[5])
data_list.append(seat)
data_list.append(mlg)
data_list.append(eng)
data_list.append(power)
data_list.append(2020-carList[4])

for i in range(6,11):
   if trainedData.columns[i] == 'Fuel_Type_'+ fuel:
       data_list.append(1)
   else:
       data_list.append(0)
      
for i in range(11,13):
   if trainedData.columns[i] == 'Transmission_'+ trans:
       data_list.append(1)
   else:
       data_list.append(0)
   
for i in range(13,17):
   if trainedData.columns[i] == 'Owner_Type_'+ owner:
       data_list.append(1)
   else:
       data_list.append(0)

for i in range(17, len(trainedData.columns)):
   if trainedData.columns[i] == 'brand_name_' + carList[0]:
       data_list.append(1)
   else:
       data_list.append(0)
   
data_list[2]=data_list[2].split(' ')[0]
data_list[3]=data_list[3].split(' ')[0]
data_list[4]=data_list[4].split(' ')[0]
data_list[2]=float(data_list[2])
data_list[3]=float(data_list[3])
data_list[4]=float(data_list[4])

for i in range(len(data_list)):
   data_list[i] = (data_list[i] - trainedData.iloc[:,i].mean())/trainedData.iloc[:,i].std()

x_frame = pd.DataFrame([data_list])

model = joblib.load('D:/Rishu/VehicleAssistant/Scripts/prediction.sav')

result = (model.predict(x_frame))[0][0]

price = np.expm1(result)

print("%.2f" % price, flush=True)

