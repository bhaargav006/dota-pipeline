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
// nodejs library that concatenates classes
import classNames from "classnames";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";
import Pusher from 'pusher-js';
import moment from 'moment';

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
  }

  state = {
    matchCount: 0,
    dataProcessedPerSecond: []
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
        </div>
      </>
    );
  }
}

export default Dashboard;
