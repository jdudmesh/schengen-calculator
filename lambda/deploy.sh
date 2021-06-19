#!/bin/zsh
rm -rf python/lib/python3.8/site-packages/*
docker run -v "$PWD":/var/task "lambci/lambda:build-python3.8" /bin/sh -c "pip install -r requirements.txt -t python/lib/python3.8/site-packages/; exit"
zip -r ../SchengenCalculatorLayer.zip python
aws lambda publish-layer-version --layer-name SchengenCalculator --compatible-runtimes python3.8 --zip-file fileb://../SchengenCalculatorLayer.zip