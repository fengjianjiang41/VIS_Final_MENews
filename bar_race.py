import pandas as pd
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import json

# 下载停用词列表
nltk.download('stopwords')
nltk.download('punkt')

# 读取新闻文本库
data = pd.read_csv('data.csv')  # 假设CSV文件包含headline, date, description, url列

# 合并所有description文本
data['date'] = pd.to_datetime(data['date'])
data.sort_values('date', inplace=True)

# 过滤 2022 年及以后的数据
data = data[data['date'] >= '2023-09-01']

# 提取重点词汇并计算词频
stop_words = set(stopwords.words('english'))
def get_keywords(description):
    words = word_tokenize(description)
    filtered_words = [word.lower() for word in words if word.lower() not in stop_words and word.isalpha()]
    return filtered_words

data['keywords'] = data['headline'].apply(get_keywords)
all_keywords = data.explode('keywords')

# 按月份和关键词计算词频
all_keywords['month'] = all_keywords['date'].dt.to_period('M')
keyword_counts = all_keywords.groupby(['month', 'keywords']).size().unstack(fill_value=0)

# 获取从 2022 年及以后的月份范围
months = pd.period_range(start='2023-09', end=keyword_counts.index.max(), freq='M')

# 确保每个关键词都有一个完整月份范围的词频列表
keyword_counts = keyword_counts.reindex(months, fill_value=0).transpose()
print(keyword_counts.shape)

# 将keywords写入一个json文件
keywords_list = keyword_counts.index.tolist()
with open('keywords.json', 'w',encoding='utf-8') as f:
    json.dump(keywords_list, f,ensure_ascii=False)

# 将每个keyword随时间变化的词频写入另一个json文件
# 词频数列表，每一项代表每个月的词频数
keywords_frequency = keyword_counts.values.tolist()
with open('keywords_frequency.json', 'w',encoding='utf-8') as f:
    json.dump(keywords_frequency, f,ensure_ascii=False)

print("JSON files have been successfully created.")
