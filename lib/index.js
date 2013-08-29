
var path = require('path')
  , mkdirp = require('mkdirp')
  , fs   = require('fs')

  , utils = require('./utils');

module.exports = OrgFile;

/********** A dataset - loaded ***********/

function OrgFile(ipath, full, options) {
  this.fname = path.join(ipath, utils.index_name);
  this.ipath = ipath;
  this.chunks = utils.read(this.fname, options);
  this.options = options;
  this.dirty = this.chunks.dirty;
  this.full = false;
  if (full) {
    this.fillOut();
  }
  this.full = full;
}

OrgFile.prototype = {

  fillOut: function () {
    if (this.full) {
      console.log('already full');
      return;
    }
    for (var i=0; i<this.chunks.majors.length; i++) {
      var major = this.chunks.majors[i];
      var chunks = utils.getFull(path.join(this.ipath, major.properties.slug), this.options);
      this.dirty = this.dirty || chunks.dirty;
      major.children = chunks.children;
    }
  },

  save: function (force) {
    if (!this.dirty && !force){
      return;
    }
    if (this.full) {
      utils.store(this.ipath, this.chunks.children);
    } else {
      utils.write(this.ipath, this.chunks.children);
    }
    this.dirty = false;
  },

  modify: function (oid, child) {
    this.dirty = true;
    var found = this.chunks.ids[oid];
    found.title = child.title;
    found.tags = child.tags;
    found.properties = child.properties;
    // not messing with children here
  },

  move: function (oid, poida, poidb, index) {
    this.dirty = true;
    var found = this.chunks.ids[oid]
    , pa = this.chunks.ids[poida]
    , pb = this.chunks.ids[poidb]
    , ia = pa.children.indexOf(found);
    console.log(found, pa, pb, ia, oid, poida, poidb, index);
    pa.children.splice(ia, 1);
    pb.children.splice(index, 0, found);
  },

  add: function (child, poid, index) {
    this.dirty = true;
    var parent = this.chunks.ids[poid];
    parent.children.splice(index, 0, child);
    this.chunks.ids[child.properties.id] = child;
  },

  remove: function (id, pid) {
    this.dirty = true;
    var parent = this.chunks.ids[pid]
    , child = this.chunks.ids[id]
    , index = parent.children.indexOf(child);
    parent.children.splice(index, 1);
    delete this.chunks.ids[id];
  },

  promote: function (oid) {
    throw new Error('Not Implemented');
  },

  demote: function (oid) {
    throw new Error('Not Implemented');
  }

};

