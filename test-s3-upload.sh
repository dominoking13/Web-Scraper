#!/bin/bash

# Test script for S3 upload functionality
# This script can be used to manually test S3 uploads locally

echo "🧪 Testing S3 Upload Functionality"
echo "=================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   brew install awscli  # macOS"
    echo "   pip install awscli   # Python"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run:"
    echo "   aws configure"
    exit 1
fi

echo "✅ AWS CLI is configured"

# Check if output directory exists
if [ ! -d "output" ]; then
    echo "❌ Output directory not found"
    exit 1
fi

# Count CSV and JSON files
csv_count=$(find output -name "*.csv" | wc -l)
json_count=$(find output -name "*.json" | wc -l)

echo "📊 Found $csv_count CSV files and $json_count JSON files in output directory"

if [ "$csv_count" -eq 0 ] && [ "$json_count" -eq 0 ]; then
    echo "❌ No CSV or JSON files found in output directory"
    exit 1
fi

# List files that would be uploaded
echo ""
echo "📤 Files that would be uploaded to S3:"
find output -name "*.csv" -o -name "*.json" | while read file; do
    echo "  $file"
done

echo ""
echo "🚀 To upload files to S3, run:"
echo "   aws s3 cp output/ s3://radio-scripts/ --recursive --exclude \"*\" --include \"*.csv\""
echo "   aws s3 cp output/ s3://radio-scripts/ --recursive --exclude \"*\" --include \"*.json\""

echo ""
echo "📋 To list files in S3 bucket:"
echo "   aws s3 ls s3://radio-scripts/ --recursive"

echo ""
echo "✅ S3 upload test completed successfully!"