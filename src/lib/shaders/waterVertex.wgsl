fn checker( inputUV:vec2<f32> ) -> f32 {

	var uv = inputUV * 2.0;

	var cx = floor( uv.x );
	var cy = floor( uv.y );

	var result = f32( i32( cx + cy ) % i32( 2.0 ) );

	return sign( result );

}