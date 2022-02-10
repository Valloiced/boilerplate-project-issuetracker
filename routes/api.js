'use strict';
const MongoID = require('mongodb').ObjectId

module.exports = function (app, Db) {    
  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project
      let openQ = req.query.open || false;
      let assignedToQ = req.query.assigned_to || false
      let id = req.query._id || false
      let created_byQ = req.query.created_by || false
     
      Db.find({project: project}, (err, data) => {
        if(err) return res.send(err)
        let users = []

        data.map(user => {
        if(openQ && openQ != String(user.open)){
          return false
        } if(assignedToQ && user.assigned_to != assignedToQ){
          return false
        } if(id && user.id != id){
          return false
        } if(created_byQ && user.created_by != created_byQ){
          return false
        }
            users.push({
              assigned_to: user.assigned_to,
              status_text: user.status_text,
              open: user.open,
              _id: user._id,
              issue_title: user.issue_title,
              issue_text: user.issue_text,
              created_by: user.created_by,
              created_on: user.created_on,
              updated_on: user.updated_on
            })
        })
        res.send(users)
      })
    })

    .post(function (req, res){
      let project = req.params.project
      let title = req.body.issue_title
      let text = req.body.issue_text
      let createdDate = new Date()
      let updatedDate = createdDate
      let createdBy = req.body.created_by
      let assignedTo = req.body.assigned_to || ""
      let status = req.body.status_text || ""

      if(!title || !text || !createdBy){
        return res.json({error: "required field(s) missing"})
      }

      let createIssue = new Db({
        project: project,
        issue_title: title,
        issue_text: text,
        created_on: createdDate,
        updated_on: updatedDate,
        created_by: createdBy,
        assigned_to: assignedTo,
        open: true,
        status_text: status,
      })

      createIssue.save((err, data) => {
        res.json({
          assigned_to: data.assigned_to,
          status_text: data.status_text,
          open: data.open,
          _id: data._id,
          issue_title: data.issue_title,
          issue_text: data.issue_text,
          created_by: data.created_by,
          created_on: data.created_on,
          updated_on: data.updated_on
        })
      })
    })
    
    .put(function (req, res){
      let project = req.params.project;
      let bo = req.body
      let findId = bo._id
      let checkItems = []

      for(let n in bo){
        if(bo[n]){
          checkItems.push(bo[n])
        }
      }

      if(!findId){
        return res.json({error: "missing _id"})
      } else if(checkItems.length == 1){
        return res.json({error: 'no update field(s) sent', _id: findId})
      }

      Db.find({project: project}, (err, data) => {
        let user
        data.map(issue => {
          if(issue.id == findId){
            user = issue
          }
        })

      if(user){
        let title = bo.issue_title || user.issue_title
        let text = bo.issue_text || user.issue_text
        let creator = bo.created_by || user.created_by
        let assignedTo = bo.assigned_to || user.assigned_to
        let status = bo.status_text || user.status_text
        let open = bo.open

          Db.findOneAndUpdate({_id: user._id}, {
            issue_title: title,
            issue_text: text,
            updated_on: new Date(),
            created_by: creator,
            assigned_to: assignedTo,
            status_text: status,
            open: open || true 
          }, {new: true}, (err, doc) => {
            return res.json({  result: 'successfully updated', '_id': findId })
          })
        } else {
          return res.json({error: "could not update", _id: findId})
        }
      })

    })
    
    .delete(function (req, res){
      let project = req.params.project;
      let id = req.body._id

      if(!id){
        return res.json({error: 'missing _id'})
      }

      Db.deleteOne({project: project, _id: new MongoID(id)}, (err, doc) => {
        if(doc.deletedCount == 0){
          return res.json({error: 'could not delete', _id: id})
        }
        res.json({result: "successfully deleted", _id: id})
      })
    });
};
