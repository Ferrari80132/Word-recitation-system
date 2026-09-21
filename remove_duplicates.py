#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
词库去重脚本
从词库文件中移除重复的单词，保留第一次出现的记录
"""

import os
import sys
from datetime import datetime


def merge_meanings(meanings):
    """
    合并多个释义，去除重复的部分

    Args:
        meanings: 释义列表

    Returns:
        str: 合并后的释义
    """
    # 将所有释义按分号或逗号分割
    all_parts = []
    for meaning in meanings:
        # 按分号和逗号分割
        parts = meaning.replace('；', ';').replace('，', ',').replace(';', ',').split(',')
        all_parts.extend([p.strip() for p in parts if p.strip()])

    # 去重，保持顺序
    seen = set()
    unique_parts = []
    for part in all_parts:
        part_lower = part.lower()
        if part_lower not in seen:
            seen.add(part_lower)
            unique_parts.append(part)

    # 合并，使用中文分号
    return '；'.join(unique_parts)


def remove_duplicates(input_file, output_file):
    """
    去除词库文件中的重复单词，并合并释义

    Args:
        input_file: 输入文件路径
        output_file: 输出文件路径

    Returns:
        tuple: (原始行数, 去重后行数, 重复数量)
    """
    print(f"\n处理文件: {input_file}")

    word_data = {}  # {word: {'pos': '', 'meanings': [], 'lines': []}}
    total_lines = 0
    duplicates = []

    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        total_lines = len(lines)

        for line_num, line in enumerate(lines, 1):
            line = line.strip()

            # 跳过空行
            if not line:
                continue

            # 分割单词和释义
            parts = line.split('\t')
            if len(parts) >= 2:
                word = parts[0].strip()
                word_lower = word.lower()
                definition = parts[1].strip()

                # 提取词性和释义
                pos = ''
                meaning = definition

                # 尝试提取词性（如 n. v. adj. adv. 等）
                if '. ' in definition[:20]:  # 词性通常在前面
                    pos_parts = definition.split('. ', 1)
                    if len(pos_parts[0]) <= 10 and pos_parts[0].replace('.', '').replace('/', '').isalpha():
                        pos = pos_parts[0] + '.'
                        meaning = pos_parts[1]

                # 如果单词已存在，合并
                if word_lower in word_data:
                    duplicates.append((line_num, word_lower, line))
                    word_data[word_lower]['meanings'].append(meaning)
                    word_data[word_lower]['lines'].append(line_num)
                else:
                    word_data[word_lower] = {
                        'original': word,  # 保留原始大小写
                        'pos': pos,
                        'meanings': [meaning],
                        'lines': [line_num]
                    }

        # 生成去重后的行
        unique_lines = []
        for word_lower, data in word_data.items():
            # 合并所有释义
            merged_meaning = merge_meanings(data['meanings'])

            # 组合完整定义
            if data['pos']:
                full_definition = f"{data['pos']} {merged_meaning}"
            else:
                full_definition = merged_meaning

            # 生成行
            line = f"{data['original']}\t{full_definition}\n"
            unique_lines.append(line)

        # 写入去重后的文件
        with open(output_file, 'w', encoding='utf-8') as f:
            f.writelines(unique_lines)

        print(f"  原始行数: {total_lines}")
        print(f"  唯一单词: {len(unique_lines)}")
        print(f"  重复单词: {len(duplicates)}")
        print(f"  已保存到: {output_file}")

        # 保存重复单词列表到日志
        if duplicates:
            log_file = output_file.replace('.txt', '_duplicates.log')
            with open(log_file, 'w', encoding='utf-8') as f:
                f.write(f"重复单词日志 - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"文件: {input_file}\n")
                f.write(f"{'='*60}\n\n")

                # 按单词分组显示
                merged_info = {}
                for line_num, word, line in duplicates:
                    if word not in merged_info:
                        merged_info[word] = []
                    merged_info[word].append((line_num, line))

                for word, occurrences in sorted(merged_info.items()):
                    f.write(f"单词: {word} (出现 {len(occurrences) + 1} 次)\n")
                    for line_num, line in occurrences:
                        f.write(f"  行 {line_num}: {line}\n")

                    # 显示合并后的结果
                    if word in word_data:
                        merged = merge_meanings(word_data[word]['meanings'])
                        f.write(f"  合并后: {word_data[word]['pos']} {merged}\n")
                    f.write("\n")

            print(f"  重复记录已保存到: {log_file}")

        return total_lines, len(unique_lines), len(duplicates)

    except Exception as e:
        print(f"错误: {e}")
        import traceback
        traceback.print_exc()
        return 0, 0, 0


def main():
    """主函数"""
    print("="*60)
    print("词库去重工具")
    print("="*60)

    # 设置路径
    lexicon_dir = os.path.join(os.path.dirname(__file__), 'lexicon')
    backup_dir = os.path.join(lexicon_dir, 'backup')

    # 创建备份目录
    os.makedirs(backup_dir, exist_ok=True)

    files = [
        ('CET-6.txt', 'CET-6词库'),
        ('postgraduate entrance exams.txt', '考研词库')
    ]

    total_removed = 0

    for filename, name in files:
        input_file = os.path.join(lexicon_dir, filename)
        output_file = os.path.join(lexicon_dir, filename)
        backup_file = os.path.join(backup_dir, f"{filename}.backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}")

        if not os.path.exists(input_file):
            print(f"\n警告: 文件不存在 - {input_file}")
            continue

        print(f"\n处理 {name}...")

        # 备份原文件
        import shutil
        shutil.copy2(input_file, backup_file)
        print(f"  已备份到: {backup_file}")

        # 去重
        original, unique, removed = remove_duplicates(backup_file, output_file)
        total_removed += removed

    print("\n" + "="*60)
    print("处理完成！")
    print("="*60)
    print(f"总共移除了 {total_removed} 个重复单词")
    print("\n提示:")
    print("1. 原始文件已备份到 lexicon/backup/ 目录")
    print("2. 重复单词的详细记录保存在 *_duplicates.log 文件中")
    print("3. 请运行以下命令重新导入词库:")
    print("   python3 import_lexicon.py")


if __name__ == '__main__':
    main()
