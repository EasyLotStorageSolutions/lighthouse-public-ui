// Published category spotlights. Replace a source with an uploaded HTTPS video
// or set mode:'youtube' and source to a YouTube link. mode:'image' keeps a cover.
const asset = file => new URL('./assets/' + file, import.meta.url).href;
export const featuredVideos = Object.fromEntries(['storage','employment','social','marketplace','music'].map(id => [id, {
  mode:'video',
  source:asset(id === 'storage' ? 'lighthouse-storage-facility-walkthrough.mp4' : 'lighthouse-guides/' + id + '.mp4'),
  poster:asset(id === 'storage' ? 'lighthouse-storage-facility-poster.jpg' : 'lighthouse-guides/' + id + '-poster.jpg'),
  captions:id === 'storage' ? '' : asset('lighthouse-guides/' + id + '.vtt')
}]));
