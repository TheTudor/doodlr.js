Template.Presentation.onRendered(function() {
  Reveal.initialize();
});

Template.Presentation.helpers({
  blocks: [
    {block_id: "x7y1"},
    {block_id: "x7y2"},
    {block_id: "x7y3"},
    {block_id: "x7y4"},
    {block_id: "x7y5"},
    {block_id: "x7y6"},
    {block_id: "x7y7"},
    {block_id: "x7y8"},
  ],
});

Template.Slide.onRendered(function() {
  var block = this.find('canvas');
  var block_id = block.id;

  var ctx = block.getContext('2d');
  loadImage(block_id, ctx, block.width, block.height);
});