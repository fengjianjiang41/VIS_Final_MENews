import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
import json

# 下载必要的NLTK资源
nltk.download('stopwords')
nltk.download('punkt')

# 读取txt文件
with open('data_description.txt', 'r', encoding='utf-8') as file:
    text = file.read()

# 定义停用词
stop_words = set(stopwords.words('english'))

# 对文本进行分词并去除停用词
words = word_tokenize(text)
filtered_words = [word.lower() for word in words if word.lower() not in stop_words and word.isalpha()]

# 计算每个词的词频
word_counts = {}
for word in filtered_words:
    if word in word_counts:
        word_counts[word] += 1
    else:
        word_counts[word] = 1

# 创建词频JSON数据并按词频降序排列，保留前100个词频最高的数据
word_freq_data = [{"name": word, "value": count} for word, count in sorted(word_counts.items(), key=lambda item: item[1], reverse=True)[:100]]

# 保存为JSON文件
with open('word_freq_data.json', 'w', encoding='utf-8') as json_file:
    json.dump(word_freq_data, json_file, ensure_ascii=False, indent=4)

print("词频数据已保存为word_freq_data.json文件，并已按词频降序排列，保留前100个词频最高的数据。")
