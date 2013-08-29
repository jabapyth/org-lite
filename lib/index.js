
var path = require('path')
  , mkdirp = require('mkdirp')
  , fs   = require('fs')

  , utils = require('./utils');

module.exports = OrgFile;

/********** A dataset - loaded ***********/

function OrgFile(ipath, full, options) {
  this.fname = path.join(ipath, utils.index_name);
  this.ipath = ipath;
  this.chunks = utils.getFull(ipath, options);
  this.chunks.major = this.chunks;
  this.options = options;
}

OrgFile.prototype = {

  fillOut: function () {
    /*
    if (this.full) {
      console.log('already full');
      return;
    }
    for (var i=0; i<this.chunks.majors.length; i++) {
      var major = this.chunks.majors[i];
      major.fname = path.join(this.ipath, major.properties.slug);
      var chunks = utils.getFull(major.fname, this.options);
      this.dirty = this.dirty || chunks.dirty;
      major.children = chunks.children;
      major.dirty = chunks.dirty;
    }
    */
  },

  save: function (force) {
    utils.saveDirty(this.chunks);
    this.dirty = false;
  },

  get: function (id) {
    var chunks = this.chunks
      , found = this.chunks.ids[id];
    if (id === null) {
      this.chunks.dirty = true;
      return {
        found: this.chunks, chunks: this.chunks, root: true
      };
    }
    if (!found) {
      chunks = this.chunks.childids[id];
      if (!chunks) {
        throw new Error('Could not find ' + id);
      }
      found = chunks.ids[id];
    }
    chunks.dirty = true;
    return {found: found, chunks: chunks, root: chunks === this.chunks};
  },

  modify: function (oid, child) {
    var found = this.get(oid).found;
    found.title = child.title;
    found.tags = child.tags;
    found.properties = child.properties;
  },

  move: function (oid, poida, poidb, index) {
    var found = this.get(oid).found
      , pa = this.get(poida).found
      , pb = this.get(poidb).found
      , ia = pa.children.indexOf(found);
    // console.log(found, pa, pb, ia, oid, poida, poidb, index);
    pa.children.splice(ia, 1);
    pb.children.splice(index, 0, found);
  },

  add: function (child, poid, index) {
    this.dirty = true;
    var parent = this.get(poid);
    parent.found.children.splice(index, 0, child);
    if (parent.root) {
      this.chunks.ids[child.properties.id] = child;
    } else {
      parent.chunks.ids[child.properties.id] = child;
      this.chunks.childids[child.properties.id] = parent.chunks;
    }
  },

  remove: function (id, pid) {
    this.dirty = true;
    var parent = this.get(pid).found
      , child = this.get(id)
      , index = parent.children.indexOf(child.found);
    parent.children.splice(index, 1);
    if (child.root) {
      delete this.chunks.ids[id];
    } else {
      delete this.chunks.childids[id].ids[id];
      delete this.chunks.childids[id];
    }
  },

  promote: function (oid) {
    throw new Error('Not Implemented');
  },

  demote: function (oid) {
    throw new Error('Not Implemented');
  }

};

