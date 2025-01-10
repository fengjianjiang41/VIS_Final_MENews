
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# 下载停用词列表
nltk.download('stopwords')
nltk.download('punkt')
# 指定文件路径

file_path = 'data_description.txt'

# 读取TXT文件内容
with open(file_path, 'r', encoding='utf-8') as file:
    text = file.read()

# 示例文本
#text = "If his first term in the White House is any indication, President-elect Donald Trump is likely to keep the Middle East high on his agenda."
# 分词
words = word_tokenize(text)

# 获取英语停用词列表
stop_words = set(stopwords.words('english'))

# 去除停用词
filtered_words = [word for word in words if word.lower() not in stop_words]

# 结果
filtered_text = ' '.join(filtered_words)
with open('data_description_filtered.txt', 'w', encoding='utf-8') as file: 
    file.write(filtered_text)
