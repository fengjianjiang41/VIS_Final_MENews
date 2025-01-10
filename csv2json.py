import pandas as pd

# 读取CSV文件
csv_file = 'data_compound.csv'
data = pd.read_csv(csv_file)

# 将数据转换为JSON格式
json_data = data.to_json(orient='records', force_ascii=False)

# 保存JSON文件
with open('data_compound.json', 'w', encoding='utf-8') as json_file:
    json_file.write(json_data)

print("CSV文件成功转换为JSON文件！")
