// Moddle descriptor for custom Entidr BPMN attributes
const entidrModdle = {
  name: 'Entidr',
  uri: 'http://entidr.io/schema/bpmn',
  prefix: 'entidr',
  types: [
    {
      name: 'ModelerProperties',
      isAbstract: true,
      extends: ['bpmn:BaseElement'],
      properties: [
        { name: 'assignee', isAttr: true, type: 'String' },
        { name: 'sla', isAttr: true, type: 'String' },
        { name: 'script', isAttr: true, type: 'String' }
      ]
    }
  ]
};

export default entidrModdle;

