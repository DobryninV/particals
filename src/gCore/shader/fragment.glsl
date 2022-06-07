varying vec2 vUv;
varying vec3 vPos;
varying vec2 vCoordinates;
uniform sampler2D t1, t2;
uniform sampler2D mask;
uniform float move;


void main() {

    vec4 maskTexture = texture2D(mask, gl_PointCoord);
    vec2 myUv = vec2(vCoordinates.x/512.,vCoordinates.y/512.);
    vec4 image1 = texture2D(t1, myUv);
    vec4 image2 = texture2D(t2, myUv);

    vec4 final = mix(image1, image2, smoothstep(.0, 1., fract(move)));

    float alpha = 1. - clamp(0., 1., abs(vPos.z/900.));
    gl_FragColor = final;

    // gl_FragColor.a *= maskTexture.r;
}