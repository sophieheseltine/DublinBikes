import pickle
import pandas

loaded_model = pickle.load(open('..//Analysis/finalized_model.sav', 'rb'))
result = loaded_model.score()
print(result)