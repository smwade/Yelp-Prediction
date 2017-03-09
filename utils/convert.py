from __future__ import division, print_function
import glob
import json
import pandas as pd

def _convert(x):
    ''' Convert a json string to a flat python dictionary
    which can be passed into Pandas. '''
    ob = json.loads(x)
    for k, v in ob.items():
        if isinstance(v, list):
            ob[k] = ','.join(v)
        elif isinstance(v, dict):
            for kk, vv in v.items():
                ob['%s_%s' % (k, kk)] = vv
            del ob[k]
    return ob

def json_to_csv(path):
    """ Change yelp json data to csv. """
    for json_filename in glob(path + '*.json'):
        csv_filename = '%s.csv' % json_filename[:-5]
        print('Converting %s to %s' % (json_filename, csv_filename))
        df = pd.DataFrame([_convert(line) for line in file(json_filename)])
        df.to_csv(csv_filename, encoding='utf-8', index=False)
