import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
import json

# 读取CSV文件
data = pd.read_csv('data_compound.csv')

# 假设CSV文件包含 'headline', 'date', 'description', 'url' 列
# 我们使用 'description' 列进行文本向量化
descriptions = data['description'].fillna('')

# 使用TF-IDF向量化器将文本转换为数值
vectorizer = TfidfVectorizer(stop_words='english')
X = vectorizer.fit_transform(descriptions)

# 使用KMeans进行聚类分析
num_clusters = 3  # 你可以根据需要调整聚类数量
kmeans = KMeans(n_clusters=num_clusters, random_state=42)
kmeans.fit(X)
labels = kmeans.labels_

# 将聚类结果添加到原始数据中
data['cluster'] = labels

# 使用PCA将高维数据降至二维以便可视化
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X.toarray())

# 绘制散点图
plt.figure(figsize=(10, 7))
colors = ['r', 'g', 'b']

for i in range(num_clusters):
    plt.scatter(X_pca[labels == i, 0], X_pca[labels == i, 1], c=colors[i], label=f'Cluster {i+1}')

plt.title('News Clustering')
plt.xlabel('Principal Component 1')
plt.ylabel('Principal Component 2')
plt.legend()
plt.show()

# 保存每个类别的PCA特征值到JSON文件
clusters = {}

for i in range(num_clusters):
    # 获取每个类别的PCA特征值
    cluster_pca = X_pca[labels == i]
    clusters[f'Cluster {i+1}'] = cluster_pca.tolist()  # 将numpy数组转换为列表以便保存为JSON

# 将PCA结果写入JSON文件
with open('clusters_pca.json', 'w') as json_file:
    json.dump(clusters, json_file, indent=4)

# 保存每个类别的标题到JSON文件
cluster_titles = {}

for i in range(num_clusters):
    # 获取每个类别的标题
    titles = data[data['cluster'] == i]['title'].tolist()
    # 处理Unicode字符
    titles = [title.encode('ascii', 'ignore').decode('ascii') for title in titles]
    cluster_titles[f'Cluster {i+1}'] = titles

# 将结果写入JSON文件
with open('cluster_titles.json', 'w') as json_file:
    json.dump(cluster_titles, json_file, indent=4)

print("PCA features and titles of each cluster have been saved to clusters_pca.json and cluster_titles.json respectively.")
