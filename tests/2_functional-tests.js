const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('Post Request Test', () => {
      test('Create an issue with every field: POST request to /api/issues/{project}', (done) => {
          chai
          .request(server)
          .post("/api/issues/test")
          .send({
              issue_title: "Testing",
              issue_text: "Wtf is happening",
              created_by: "Valloiced",
              assigned_to: "Cringy Boy",
              status_text: "Under Erection"
          })
          .end((err, res) => {
              assert.equal(res.status, 200)
              assert.containsAllKeys(res.body, ['_id', 'assigned_to', 'created_by', 'created_on', 'issue_title', 'open', 'status_text', 'updated_on'])
              assert.isObject(res.body)
              done()
            })
      })

      test('Create an issue with only required fields: POST request to /api/issues/{project}', (done) => {
          chai
          .request(server)
          .post("/api/issues/test")
          .send({
              issue_title: "Testing2",
              issue_text: "Wtf is this",
              created_by: "Nileshit"
          })
          .end((err, res) => {
              assert.isObject(res.body)
              assert.include(res.body, {issue_title: "Testing2"})
              assert.include(res.body, {issue_text: "Wtf is this"})
              assert.include(res.body, {created_by: "Nileshit"})
              done()
          })
      })
      test('Create an issue with missing required fields: POST request to /api/issues/{project}', (done) => {
          chai
          .request(server)
          .post("/api/issues/test")
          .send({
              issue_title: "Missing required fields"
          })
          .end((err, res) => {
              assert.equal(res.body.error, 'required field(s) missing')
              done()
          })
      })
      test('View issues on a project: GET request to /api/issues/{project}', (done) => {
          chai
          .request(server)
          .get('/api/issues/test')
          .end((err, res) => {
              assert.isArray(res.body)
              for(let i = 0; i < res.body.length; i++){
                assert.containsAllKeys(res.body[i], ['_id', 'assigned_to', 'created_by', 'created_on', 'issue_title', 'open', 'status_text', 'updated_on'])
              }
              done()
          })
      })
      test('View issues on a project with one filter: GET request to /api/issues/{project}', (done) => {
          chai
          .request(server)
          .get('/api/issues/test?open=false')
          .end((err, res) => {
              assert.isArray(res.body)
              assert.lengthOf(res.body, 0)
              done()
          })
      })
      test('View issues on a project with multiple filters: GET request to /api/issues/{project}', (done) => {
          chai
          .request(server)
          .get('/api/issues/test?open=true&_id=62045d90139239fdd59e867d')
          .end((err, res) => {
              assert.isArray(res.body)
              assert.include(res.body[0], {_id: "62045d90139239fdd59e867d"})
              assert.lengthOf(res.body, 1)
              done()
          })
      })
      test('Update one field on an issue: PUT request to /api/issues/{project}', (done) => {
          chai
          .request(server)
          .put('/api/issues/test')
          .send({
              _id: "62045ffb8cc0260b63edde88",
              issue_title: "Changed"
          })
          .end((err, res) => {
              assert.isObject(res.body)
              assert.equal(res.body.result, "successfully updated")
              done()
          })
      })
      test('Update multiple fields on an issue: PUT request to /api/issues/{project}', (done) => {
        chai
        .request(server)
        .put('/api/issues/test')
        .send({
            _id: "62045ffb8cc0260b63edde88",
            issue_title: "Changed",
            created_by: "Changed",
            assigned_to: "Changed"
        })
        .end((err, res) => {
            assert.isObject(res.body)
            assert.equal(res.body.result, "successfully updated")
            done()
        })
      })
      test('Update an issue with missing _id: PUT request to /api/issues/{project}', (done) => {
          chai
          .request(server)
          .put('/api/issues/test')
          .send({
              issue_title: "No Id"
          })
          .end((err, res) => {
              assert.isObject(res.body)
              assert.equal(res.body.error, "missing _id")
              done()
          })
      })
      test('Update an issue with no fields to update: PUT request to /api/issues/{project}', (done) => {
          chai
          .request(server)
          .put('/api/issues/test')
          .send({
              _id: "62045ffb8cc0260b63edde88"
          })
          .end((err, res) => {
              assert.isObject(res.body)
              assert.deepEqual(res.body.error, 'no update field(s) sent')
              assert.deepEqual(res.body._id, '62045ffb8cc0260b63edde88')
              done()
          })
      })
      test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', (done) => {
          chai
          .request(server)
          .put('/api/issues/test')
          .send({
              _id: "5871dda29faedc3491ff93bb",
              issue_text: "Must Error"
          })
          .end((err, res) => {
              assert.isObject(res.body)
              assert.deepEqual(res.body.error, "could not update")
              assert.deepEqual(res.body._id, "5871dda29faedc3491ff93bb")
              done()
          })
      })
      test('Delete an issue: DELETE request to /api/issues/{project}', (done) => {
          chai
          .request(server)
          .delete('/api/issues/test')
          .send({
              _id: "620468145750fba31b5e2ab4"
          })
          .end((err, res) => {
              assert.isObject(res.body)
              assert.deepEqual(res.body.result, "successfully deleted")
              assert.deepEqual(res.body._id, "620468145750fba31b5e2ab4")
              done()
          })
      })
      test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}',(done) => {
          chai
          .request(server)
          .delete('/api/issues/test')
          .send({
              _id: "5871dda29faedc3491ff93bb"
          })
          .end((err, res) => {
              assert.isObject(res.body)
              assert.deepEqual(res.body.error, "could not delete")
              assert.deepEqual(res.body._id, "5871dda29faedc3491ff93bb")
              done()
          })
      })
      test('Delete an issue with missing _id: DELETE request to /api/issues/{project}',(done) => {
          chai
          .request(server)
          .delete('/api/issues/test')
          .send({})
          .end((err, res) => {
              assert.deepEqual(res.body.error, "missing _id")
              done()
          })
      })
  })
});
