# リポジトリガイドライン

## プロジェクト概要

このリポジトリは、作業5分・休憩25分で構成される "逆" ポモドーロアプリを作成するためのものです。

本来 "rohdomopo" というリポジトリは HTML・CSS・JavaScript のみで構成された Web アプリ開発コンテストのために作成されたものです。 "rohdomopo-ai" では、AIエージェントの指示のみで同様のアプリを構築することを目的とします。

## 技術スタック

- HTML
- CSS
- Vanilla JavaScript

### 制約事項

#### 外部ライブラリ・フレームワークの禁止

React、Vue、Tailwind CSS、jQuery などは一切使用しないでください。

#### 外部リソースの禁止

CDN 経由のスクリプトの読み込み、外部アイコンライブラリなどは一切使用せず、ネイティブの機能 (HTML/CSS/JS) のみで実装してください。

**例外**: 日本語フォントの Noto Serif Japanese (https://fonts.google.com/noto/specimen/Noto+Serif+JP) 、 英字フォントの Noto Serif (https://fonts.google.com/noto/specimen/Noto+Serif?query=noto+serif) を Web フォントとして使用することを許可します。

## ファイル構成の指針

エントリポイントとしてルートに `index.html` を配置してください。

スタイルは `assets/styles/` ディレクトリに配置してください。

スクリプトは`assets/scripts/` ディレクトリに ES Modules を使用し機能ごとに分割、配置してください。

## コーディング規約

"Google JavaScript Style Guide" に従ってください。

## 可読性

「AIが読めるから良い」ではなく、このコードを初めて見る人間が内容を理解できるよう可読性を向上させてください。

### 原則

以下の原則を厳守してください。

- KISS 原則
- DRY 原則
- YAGNI 原則
- PIE 原則
- SLAP 原則
- OCP 原則
- 名前重要の原則

### ドキュメンテーションコメント

定数・変数・関数には、JSDoc によるドキュメンテーションコメントを必ず記載してください。

ドキュメンテーションコメントは必ず日本語で記載してください。

例:
```javascript
/**
 * 与えられた引数を二乗して返します。
 *
 * @param {number} n 二乗したい数。
 * @returns {number} 二乗された数。
 */
function square(n) {
  return n ** 2;
}
```
