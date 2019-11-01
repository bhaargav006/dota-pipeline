import pandas as pd
import pickle
import logging

import sys

from faunadb.client import FaunaClient
from faunadb import query as q
from sklearn.svm import SVC

from library.constants import DATA_ROOT, LOG_ROOT, DATABASE_URL

client = FaunaClient(secret="secret", domain=DATABASE_URL, scheme="http", port="8443")

logging.basicConfig(filename=LOG_ROOT+'match_predictor_models.log', level=logging.DEBUG, format='%(levelname)s:%(asctime)s %(message)s')

firstPage = sys.argv[1]
lastPage = sys.argv[2]

# firstPage = 1
# lastPage = 3


def extractMatchPredictionDataFromDB():
    try:
        logging.info(f'[START] Extracting Match prediction data ref ids')
        if firstPage > lastPage:
            raise ValueError("First page needs to be less than or equal to the last page!!")

        matchPreds = []
        pred_ids = []
        afterPtr = False
        pageNumber = firstPage

        while pageNumber <= lastPage:
            if pageNumber == 1:
                matchPreds = client.query(
                    q.paginate(
                        q.match(
                            q.index('all_match_prediction')
                        ),
                        size=1000
                    )
                )
            else:
                matchPreds = client.query(
                    q.paginate(
                        q.match(
                            q.index('all_match_prediction')
                        ),
                        size=1000,
                        after=afterPtr
                    )
                )
            matchPredsData = matchPreds['data']
            for pred in matchPredsData:
                pred_id = pred.value['id']
                pred_ids.append(pred_id)
            if 'after' in matchPreds:
                afterPtr = matchPreds['after']
            pageNumber = pageNumber + 1
        logging.info(f'[FINISHED] Extracting Match prediction data ref ids')

        extractMatchesFeatureMatrix(pred_ids)

    except Exception as e:
        logging.error(f'Error occurred {str(e)}')


def extractMatchesFeatureMatrix(prediction_ref_ids):
    try:
        logging.info(f'[START] Extracting Matches Feature Matrix')
        predictionData = client.query(
            q.map_(
                q.lambda_(
                    'pred_ref_id',
                    q.get(q.ref(q.collection('match_prediction'), q.var('pred_ref_id')))
                ),
                prediction_ref_ids
            )
        )

        featuresLists = []
        for pred in predictionData:
            featuresLists.append(pred['data']['vector'])

        dataFrame = pd.DataFrame(featuresLists)
        dataFrame = dataFrame.iloc[:, :-2]
        logging.info(f'[FINISHED] Extracting Matches Feature Matrix')

        trainModel(dataFrame)

    except Exception as e:
        logging.error(f'Error occurred {str(e)}')


def trainModel(featureMatrix):
    try:
        logging.info(f'[START] Training Data Model')
        data = featureMatrix
        trainingData = data.iloc[:, :-1]
        radiantWinLabels = data.iloc[:, -1]
        clf = SVC(gamma='auto', max_iter=100)
        clf.fit(trainingData, radiantWinLabels)
        model_file = 'model_file.p'
        logging.info(f'[FINISHED] Training Data Model')

        storeModel(clf, model_file)
    except Exception as e:
        logging.error(f'Error occurred {str(e)}')


def storeModel(model, model_file):
    try:
        logging.info(f'[START] Storing model in pickle file: {model_file}')
        pickle.dump(model, open(DATA_ROOT+model_file, 'wb'))
        logging.info(f'[FINISHED] Storing model in pickle file: {model_file}')
    except Exception as e:
        logging.error(f'Error occurred {str(e)}')


extractMatchPredictionDataFromDB()
