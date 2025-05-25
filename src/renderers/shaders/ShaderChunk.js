import alphamap_fragment from './ShaderChunk/alphamap_fragment.glsl.js';
import alphamap_pars_fragment from './ShaderChunk/alphamap_pars_fragment.glsl.js';
import alphatest_fragment from './ShaderChunk/alphatest_fragment.glsl.js';
import bumpmap_pars_fragment from './ShaderChunk/bumpmap_pars_fragment.glsl.js';
import color_fragment from './ShaderChunk/color_fragment.glsl.js';
import color_pars_fragment from './ShaderChunk/color_pars_fragment.glsl.js';
import color_pars_vertex from './ShaderChunk/color_pars_vertex.glsl.js';
import color_vertex from './ShaderChunk/color_vertex.glsl.js';
import default_vertex from './ShaderChunk/default_vertex.glsl.js';
import defaultnormal_vertex from './ShaderChunk/defaultnormal_vertex.glsl.js';
import envmap_fragment from './ShaderChunk/envmap_fragment.glsl.js';
import envmap_pars_fragment from './ShaderChunk/envmap_pars_fragment.glsl.js';
import envmap_pars_vertex from './ShaderChunk/envmap_pars_vertex.glsl.js';
import envmap_vertex from './ShaderChunk/envmap_vertex.glsl.js';
import fog_fragment from './ShaderChunk/fog_fragment.glsl.js';
import fog_pars_fragment from './ShaderChunk/fog_pars_fragment.glsl.js';
import lightmap_fragment from './ShaderChunk/lightmap_fragment.glsl.js';
import lightmap_pars_fragment from './ShaderChunk/lightmap_pars_fragment.glsl.js';
import lightmap_pars_vertex from './ShaderChunk/lightmap_pars_vertex.glsl.js';
import lights_lambert_pars_vertex from './ShaderChunk/lights_lambert_pars_vertex.glsl.js';
import lightmap_vertex from './ShaderChunk/lightmap_pars_vertex.glsl.js';
import lights_lambert_vertex from './ShaderChunk/lights_lambert_vertex.glsl.js';
import lights_phong_fragment from './ShaderChunk/lights_phong_fragment.glsl.js';
import lights_phong_pars_fragment from './ShaderChunk/lights_phong_pars_fragment.glsl.js';
import lights_phong_pars_vertex from './ShaderChunk/lights_phong_pars_vertex.glsl.js';
import lights_phong_vertex from './ShaderChunk/lights_phong_vertex.glsl.js';
import linear_to_gamma_fragment from './ShaderChunk/linear_to_gamma_fragment.glsl.js';
import logdepthbuf_fragment from './ShaderChunk/logdepthbuf_fragment.glsl.js';
import logdepthbuf_pars_fragment from './ShaderChunk/logdepthbuf_pars_fragment.glsl.js';
import logdepthbuf_pars_vertex from './ShaderChunk/logdepthbuf_pars_vertex.glsl.js';
import logdepthbuf_vertex from './ShaderChunk/logdepthbuf_vertex.glsl.js';
import map_fragment from './ShaderChunk/map_fragment.glsl.js';
import map_pars_fragment from './ShaderChunk/map_pars_fragment.glsl.js';
import map_pars_vertex from './ShaderChunk/map_pars_vertex.glsl.js';
import map_particle_fragment from './ShaderChunk/map_particle_fragment.glsl.js';
import map_particle_pars_fragment from './ShaderChunk/map_particle_pars_fragment.glsl.js';
import map_vertex from './ShaderChunk/map_vertex.glsl.js';

import morphnormal_vertex from './ShaderChunk/morphnormal_vertex.glsl.js';
import morphtarget_pars_vertex from './ShaderChunk/morphtarget_pars_vertex.glsl.js';
import morphtarget_vertex from './ShaderChunk/morphtarget_vertex.glsl.js';


import normalmap_pars_fragment from './ShaderChunk/normalmap_pars_fragment.glsl.js';


import shadowmap_fragment from './ShaderChunk/shadowmap_fragment.glsl.js';
import shadowmap_pars_fragment from './ShaderChunk/shadowmap_pars_fragment.glsl.js';
import shadowmap_pars_vertex from './ShaderChunk/shadowmap_pars_vertex.glsl.js';
import shadowmap_vertex from './ShaderChunk/shadowmap_vertex.glsl.js';


import skinbase_vertex from './ShaderChunk/skinbase_vertex.glsl.js';
import skinning_pars_vertex from './ShaderChunk/skinning_pars_vertex.glsl.js';
import skinning_vertex from './ShaderChunk/skinning_vertex.glsl.js';
import skinnormal_vertex from './ShaderChunk/skinnormal_vertex.glsl.js';

import specularmap_fragment from './ShaderChunk/specularmap_fragment.glsl.js';
import specularmap_pars_fragment from './ShaderChunk/specularmap_pars_fragment.glsl.js';
import worldpos_vertex from './ShaderChunk/worldpos_vertex.glsl.js';
export var ShaderChunk = {
	alphamap_fragment: alphamap_fragment,
	alphamap_pars_fragment: alphamap_pars_fragment,
	alphatest_fragment: alphatest_fragment,
	bumpmap_pars_fragment: bumpmap_pars_fragment,
	color_fragment: color_fragment,
	color_pars_fragment: color_pars_fragment,
	color_pars_vertex: color_pars_vertex,
	color_vertex: color_vertex,
    default_vertex: default_vertex,
	defaultnormal_vertex: defaultnormal_vertex,
	envmap_fragment: envmap_fragment,
	envmap_pars_fragment: envmap_pars_fragment,
	envmap_pars_vertex: envmap_pars_vertex,
	envmap_vertex: envmap_vertex,
	fog_fragment: fog_fragment,
	fog_pars_fragment: fog_pars_fragment,

    lightmap_fragment:lightmap_fragment,
    lightmap_pars_fragment:lightmap_pars_fragment,
    lightmap_pars_vertex:lightmap_pars_vertex,
    lights_lambert_pars_vertex:lights_lambert_pars_vertex,
    lightmap_vertex:lightmap_vertex,
    lights_lambert_vertex:lights_lambert_vertex,
    lights_phong_fragment:lights_phong_fragment,
    lights_phong_pars_fragment:lights_phong_pars_fragment,
    lights_phong_pars_vertex:lights_phong_pars_vertex,
    lights_phong_vertex:lights_phong_vertex,

    linear_to_gamma_fragment:linear_to_gamma_fragment,

    logdepthbuf_fragment: logdepthbuf_fragment,
    logdepthbuf_pars_fragment:logdepthbuf_pars_fragment,
    logdepthbuf_pars_vertex:logdepthbuf_pars_vertex,
    logdepthbuf_vertex: logdepthbuf_vertex,

    map_fragment:map_fragment,
    map_pars_fragment:map_pars_fragment,
    map_pars_vertex:map_pars_vertex,
    map_particle_fragment:map_particle_fragment,
    map_particle_pars_fragment:map_particle_pars_fragment,
    map_vertex: map_vertex,

    morphnormal_vertex:morphnormal_vertex,
    morphtarget_pars_vertex:morphtarget_pars_vertex,
    morphtarget_vertex:morphtarget_vertex,

    normalmap_pars_fragment:normalmap_pars_fragment,

    shadowmap_fragment: shadowmap_fragment,
    shadowmap_pars_fragment:shadowmap_pars_fragment,
    shadowmap_pars_vertex:shadowmap_pars_vertex,
    shadowmap_vertex:shadowmap_vertex,

    skinbase_vertex:skinbase_vertex,
    skinning_pars_vertex:skinning_pars_vertex,
    skinning_vertex:skinning_vertex,
    skinnormal_vertex:skinnormal_vertex,

    specularmap_fragment:specularmap_fragment,
    specularmap_pars_fragment:specularmap_pars_fragment,

    worldpos_vertex: worldpos_vertex,
};
