from faunadb import query as q
from faunadb.client import FaunaClient
from library.constants import DATABASE_URL
from sklearn.model_selection import train_test_split

import pandas as pd
import pickle

client = FaunaClient(secret="secret", domain=DATABASE_URL, scheme="http", port="8443")


def testPrediction():
    matchPreds = client.query(
        q.paginate(
            q.match(
                q.index('all_match_prediction')
            ),
            size=100
        )
    )

    matchPredsData = matchPreds['data']
    pred_ids = []

    for pred in matchPredsData:
        pred_id = pred.value['id']
        pred_ids.append(pred_id)

    predictionData = client.query(
        q.map_(
            q.lambda_(
                'matchPred',
                q.get(q.ref(q.collection('match_prediction'), q.var('matchPred')))
            ),
            pred_ids
        )
    )

    featuresLists = []

    for pred in predictionData:
        featuresLists.append(pred['data']['vector'])

    dataFrame = pd.DataFrame(featuresLists)
    dataFrame = dataFrame.iloc[:, :-2]

    X_test = dataFrame.iloc[:, :-1]
    y_test = dataFrame.iloc[:, -1]
    clf = pickle.load(open('../data/model_file.p', 'rb'))
    print("Trained Model parameters:")
    print("Kernel: ",clf.kernel)
    print("Win Labels:", clf.classes_)
    print("Gamma:", clf.gamma)
    y_pred = clf.predict(X_test)
    acc = clf.score(X_test, y_test)
    print("Model Accuracy = ", acc*100, "%")


testPrediction()
