# Security Vulnerabilities Found and Fixed

このドキュメントは、tokomath/tokotokoリポジトリで発見され、修正されたセキュリティ脆弱性をまとめたものです。

## 🔴 Critical: 認可チェックの欠如 (Missing Authorization Checks)

### 1. joinUserToClass - 任意のクラスへの参加
**場所**: `src/app/api/class/addUserToClass.ts`

**脆弱性**: 
- 認証されたユーザーが任意のクラスIDを指定して、どのクラスにも参加できてしまう
- クラスが存在するか、ユーザーが存在するかのチェックがない

**影響**: 
- 悪意のあるユーザーが他のクラスに無断で参加できる
- 不正なデータが挿入される可能性がある

**修正内容**:
```typescript
// ユーザーとクラスの存在確認を追加
// 既に参加済みかのチェックを追加
```

### 2. setAnswerPoints - 採点権限の欠如
**場所**: `src/app/api/test/setAnswerPoints.ts`

**脆弱性**:
- 教師の権限チェックがない
- 学生が自分の回答や他の学生の回答の点数を変更できてしまう

**影響**:
- 学生が自分の点数を不正に変更できる
- 他の学生の点数を改ざんできる
- テスト結果の信頼性が完全に失われる

**修正内容**:
```typescript
// userIdパラメータを追加
// teacherAuth()で教師権限をチェック
```

### 3. updateUser/changeRole - ユーザー情報の不正変更
**場所**: `src/app/api/User/updateUser.ts`

**脆弱性**:
- 任意のユーザーの情報を変更できる
- 任意のユーザーのロール(教師/学生)を変更できる
- **特に危険**: `/setrole`ページで誰でも自分を教師に昇格できる

**影響**:
- 権限昇格攻撃が可能
- 学生が自分を教師に変更し、全ての管理機能にアクセスできる
- 他のユーザーの情報を改ざんできる

**修正内容**:
```typescript
// updateUser: 自分自身のプロファイルのみ更新可能に制限
// changeRole: 教師のみが実行可能に制限
```

## 🟠 High: レースコンディション (Race Condition)

### 4. StudentGuard - 認証前のアクセス許可
**場所**: `src/lib/guard.tsx`

**脆弱性**:
- `studentAuth()`の結果を待たずに`return null`を実行
- Promise内の`return <>{children}</>`は効果がない
- 認証チェックが完了する前にページが表示される可能性

**影響**:
- 認証されていないユーザーが一時的に保護されたコンテンツにアクセスできる可能性
- 権限のないユーザーがAPIを呼び出せる可能性

**修正内容**:
```typescript
// useStateとuseEffectを使用して非同期認証を適切に処理
// 認証が完了するまでローディング状態を表示
```

## 🟡 Medium: 非同期処理のバグ (Async/Await Bug)

### 5. studentAuth - awaitの欠如
**場所**: `src/app/api/auth/auth.ts`

**脆弱性**:
- `prisma.user.findUnique()`に`await`がない
- 常に`Promise`オブジェクトが返され、`user !== null`は常に`true`

**影響**:
- 認証チェックが機能しない
- すべてのユーザーが学生として認証される

**修正内容**:
```typescript
// awaitキーワードを追加
const user = await prisma.user.findUnique(...)
```

## 修正の影響

### 破壊的変更 (Breaking Changes)
以下のAPIは新しいパラメータが必要です:

1. `setAnswerPoints(points, userId)` - userIdを追加
2. `updateUser(id, name, email, currentUserId)` - currentUserIdを追加
3. `changeRole(userid, role, currentUserId)` - currentUserIdを追加

### 後方互換性
- 既存の呼び出し元は更新済み
- Webhookは信頼できるシステム呼び出しとして処理

## セキュリティのベストプラクティス

今後、同様の脆弱性を防ぐために:

1. **すべてのServer Actionに認可チェックを追加**
   - ユーザーが操作を実行する権限があるか確認
   - リソースへのアクセス権を検証

2. **最小権限の原則を適用**
   - ユーザーは自分のデータのみ変更可能
   - 管理操作は管理者のみ実行可能

3. **入力検証を実装**
   - IDが存在するか確認
   - データの整合性を検証

4. **非同期処理を正しく処理**
   - 常に`await`を使用
   - レースコンディションに注意

## テスト推奨事項

以下のシナリオをテストすることを推奨します:

1. 学生が他のユーザーの点数を変更しようとする
2. 学生が自分を教師にアップグレードしようとする
3. ユーザーが他のユーザーのプロファイルを変更しようとする
4. 認証されていないユーザーが保護されたリソースにアクセスしようとする
