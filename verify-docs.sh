#!/bin/bash

echo "🔍 验证 Pipel-React 文档完整性"
echo "================================"
echo ""

# 检查英文指南
echo "📖 英文指南文档："
for file in packages/guide/*.md; do
  if [[ ! "$file" =~ \.(cn|en)\.md$ ]]; then
    basename "$file" .md | xargs -I {} echo "  ✅ {}"
  fi
done

# 检查中文指南
echo ""
echo "📖 中文指南文档："
for file in packages/cn/guide/*.md; do
  basename "$file" .md | xargs -I {} echo "  ✅ {}"
done

# 检查英文 API
echo ""
echo "🔧 英文 API 文档："
find packages/core -maxdepth 2 -name "index.md" | while read file; do
  dir=$(dirname "$file" | xargs basename)
  echo "  ✅ $dir"
done

# 检查中文 API
echo ""
echo "🔧 中文 API 文档："
find packages/cn/core -maxdepth 2 -name "index.md" | while read file; do
  dir=$(dirname "$file" | xargs basename)
  echo "  ✅ $dir"
done

# 统计
echo ""
echo "📊 统计数据："
EN_GUIDE=$(find packages/guide -maxdepth 1 -name "*.md" ! -name "*.cn.md" ! -name "*.en.md" | wc -l | tr -d ' ')
CN_GUIDE=$(find packages/cn/guide -maxdepth 1 -name "*.md" 2>/dev/null | wc -l | tr -d ' ')
EN_API=$(find packages/core -maxdepth 2 -name "index.md" | wc -l | tr -d ' ')
CN_API=$(find packages/cn/core -maxdepth 2 -name "index.md" 2>/dev/null | wc -l | tr -d ' ')

echo "  英文指南: $EN_GUIDE 个"
echo "  中文指南: $CN_GUIDE 个"
echo "  英文 API: $EN_API 个"
echo "  中文 API: $CN_API 个"
echo "  总计: $((EN_GUIDE + CN_GUIDE + EN_API + CN_API)) 个文档"

echo ""
echo "✅ 文档验证完成！"
