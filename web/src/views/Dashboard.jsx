/*!

=========================================================
* Black Dashboard React v1.0.0
=========================================================

* Product Page: https://www.creative-tim.com/product/black-dashboard-react
* Copyright 2019 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/black-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import React from "react";
import { Client, query } from "faunadb"
// nodejs library that concatenates classes
import classNames from "classnames";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";
import Pusher from 'pusher-js';
import moment from 'moment';
import faunadb from 'faunadb';

// reactstrap components
import {
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  Label,
  FormGroup,
  Input,
  Table,
  Row,
  Col,
  UncontrolledTooltip
} from "reactstrap";

// core components
import {
  chartExample1,
  chartExample2,
  chartExample3,
  chartExample4
} from "variables/charts.jsx";

const client = new Client({ secret: 'secret', domain: '54.245.218.63', scheme: 'http', port: '8443'});

function get_int_value_from_key(key) {
  let sum = 0;
  for (let i=0; i<key.length;i++) {
    sum += key.charCodeAt(i)
  }
  return sum;
}

class Dashboard extends React.Component {

  componentDidMount () {
    const pusher = new Pusher('d548e35711c3a1082e31', {
      cluster: 'us2',
      forceTLS: true
    });

    const channel = pusher.subscribe('my-channel');
    channel.bind('my-event', (data) => {
      if (data) {
        this.setState({
          matchCount: data['match_count'],
          dataProcessedPerSecond: data['data_processed_per_second'].map(d => ({ ...d, time: moment(d.time).format('HH:mm:ss')}))
        })
      }
    });

    setTimeout(() => {
      client.query(
        query.Get(
          query.Ref(
            query.Collection('match_aggregate_info'),
            get_int_value_from_key('min_match_duration')
          )
        )
      ).then(
        (response) => {
          this.setState({
            min_match_duration: response['data']['data']
          })
        }
      )
      client.query(
        query.Get(
          query.Ref(
            query.Collection('match_aggregate_info'),
            get_int_value_from_key('max_match_duration')
          )
        )
      ).then(
        (response) => {
          this.setState({
            max_match_duration: response['data']['data']
          })
        }
      )
    }, 5000)
  }

  state = {
    matchCount: 0,
    dataProcessedPerSecond: [],
    min_match_duration: 0,
    max_match_duration: 0
  }

  render() {
    return (
      <>
        <div style={{ padding: 10 }}>
          <Col lg="12" className={'main-heading'}>
            DATA DIGGERS
          </Col>
          <Row>
            <Col lg="12">
              <Card className="card-chart">
                <CardHeader>
                  <h5 className="card-category">Total Match Count</h5>
                  <CardTitle tag="h3">
                    <i className="tim-icons icon-bell-55 text-info" />{" "}
                    {this.state.matchCount}
                  </CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="chart-area">
                    <Line
                      data={chartExample2.realTimeData(this.state.dataProcessedPerSecond)}
                      options={chartExample2.options}
                    />
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <Col lg="12" className={'main-heading'}>
            Min Match Duration {this.state.min_match_duration} minutes
          </Col>
          <Col lg="12" className={'main-heading'}>
            Max Match Duration {this.state.max_match_duration} minutes
          </Col>
        </div>
      </>
    );
  }
}

export default Dashboard;
