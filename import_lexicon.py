#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
词库导入脚本
从 lexicon 目录导入词库文件到 vocabulary.js
"""

import re
import os

def parse_lexicon_file(file_path):
    """解析词库文件"""
    words = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue

            # 分割单词和释义（使用 tab 分隔）
            parts = line.split('\t')
            if len(parts) < 2:
                continue

            word = parts[0].strip()
            meaning_with_pos = parts[1].strip()

            # 提取词性和释义
            # 格式: "adj. 一致的" 或 "v. 保存，保护"
            match = re.match(r'^([a-z\.]+)\s+(.+)$', meaning_with_pos)
            if match:
                pos = match.group(1)  # 词性
                meaning = match.group(2)  # 中文释义
            else:
                pos = ""
                meaning = meaning_with_pos

            words.append({
                'word': word,
                'pos': pos,
                'meaning': meaning
            })

    return words

def generate_vocabulary_js(cet6_words, kaoyan_words, output_path):
    """生成 vocabulary.js 文件"""

    js_content = '''// 词汇数据
// 自动生成，请勿手动编辑

'''

    # 生成 CET6 词汇
    js_content += 'const CET6_VOCABULARY = [\n'
    for i, word in enumerate(cet6_words):
        js_content += f'    {{ word: "{word["word"]}", pos: "{word["pos"]}", meaning: "{word["meaning"]}", frequency: {len(cet6_words) - i} }},\n'
    js_content += '];\n\n'

    # 生成考研词汇
    js_content += 'const KAOYAN_VOCABULARY = [\n'
    for i, word in enumerate(kaoyan_words):
        js_content += f'    {{ word: "{word["word"]}", pos: "{word["pos"]}", meaning: "{word["meaning"]}", frequency: {len(kaoyan_words) - i} }},\n'
    js_content += '];\n\n'

    # 添加词汇映射
    js_content += '''// 词书映射
const VOCABULARY_MAP = {
    'cet6': CET6_VOCABULARY,
    'kaoyan': KAOYAN_VOCABULARY
};
'''

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(js_content)

def main():
    """主函数"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    lexicon_dir = os.path.join(base_dir, 'lexicon')

    # 读取词库文件
    cet6_file = os.path.join(lexicon_dir, 'CET-6.txt')
    kaoyan_file = os.path.join(lexicon_dir, 'postgraduate entrance exams.txt')

    print("正在导入词库...")
    print(f"CET-6 词库: {cet6_file}")
    print(f"考研词库: {kaoyan_file}")

    # 解析词库
    cet6_words = parse_lexicon_file(cet6_file)
    kaoyan_words = parse_lexicon_file(kaoyan_file)

    print(f"✓ CET-6 词汇数量: {len(cet6_words)}")
    print(f"✓ 考研词汇数量: {len(kaoyan_words)}")

    # 生成 vocabulary.js
    output_file = os.path.join(base_dir, 'vocabulary.js')
    generate_vocabulary_js(cet6_words, kaoyan_words, output_file)

    print(f"✓ 词库已导入到: {output_file}")
    print("完成！")

if __name__ == '__main__':
    main()
