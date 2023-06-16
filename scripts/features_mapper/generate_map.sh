#!/bin/sh

KNOWN_MAP=/static/maps/code_artifacts_map.json
ALL_MAP=/static/maps/ml_components_map.json

python3 ./scripts/features_mapper/code_artifacts_mapper.py

python3 ./scripts/features_mapper/fm_artifacts_merger.py

if test -f "$KNOWN_MAP"; then
    echo "$KNOWN_MAP exists."
fi

if test -f "$ALL_MAP"; then
    echo "$ALL_MAP exists."
fi
