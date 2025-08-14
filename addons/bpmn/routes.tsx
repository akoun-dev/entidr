import React from 'react';
import { Route } from 'react-router-dom';
import { BpmnDashboardView, ProcessListView, InstanceListView, ConnectorListView } from './views/pages';

/**
 * Routes du module BPMN
 */
const routes = (
  <>
    <Route path="/bpmn" element={<BpmnDashboardView />} />
    <Route path="/bpmn/processes" element={<ProcessListView />} />
    <Route path="/bpmn/instances" element={<InstanceListView />} />
    <Route path="/bpmn/connectors" element={<ConnectorListView />} />
  </>
);

export default routes;
