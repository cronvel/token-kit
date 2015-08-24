/*
	The Cedric's Swiss Knife (CSK) - CSK token toolbox

	Copyright (c) 2015 Cédric Ronvel 
	
	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/



var u8Buffer = require( 'uint8-buffer-kit' ) ;



var MAX_UINT8 = Math.pow( 2 , 8 ) - 1 ;
var MAX_UINT16 = Math.pow( 2 , 16 ) - 1 ;
var MAX_UINT24 = Math.pow( 2 , 24 ) - 1 ;
var MAX_UINT32 = Math.pow( 2 , 32 ) - 1 ;
var tokenAutoIncrement8 = Math.floor( Math.random() * MAX_UINT8 ) ;
var tokenAutoIncrement16 = Math.floor( Math.random() * MAX_UINT16 ) ;
var tokenAutoIncrement24 = Math.floor( Math.random() * MAX_UINT24 ) ;
var tokenAutoIncrement32 = Math.floor( Math.random() * MAX_UINT32 ) ;

//console.log( tokenAutoIncrement16 , tokenAutoIncrement32 ) ;



// Generate a random token
module.exports = function tokenGenerator( structure )
{
	var i , element ;
	
	var generator = {
		structure: structure ,
		byteLength: 0
	} ;
	
	if ( ! Array.isArray( structure ) )
	{
		throw new TypeError( '[token-kit] .createTokenGenerator(), argument #0: bad token structure, it should be an Array of Object' ) ;
	}
	
	for ( i = 0 ; i < structure.length ; i ++ )
	{
		element = structure[ i ] ;
		
		if ( ! element || typeof element !== 'object' )
		{
			throw new TypeError( '[token-kit] .createTokenGenerator(), argument#0: bad token structure, it should be an Array of Object' ) ;
		}
		
		switch ( element.type )
		{
			case 'random' :
				element.genType = 'uint' ;
				element.decodeType = 'base64url' ;
				element.auto = element.type ;
				break ;
			case 'timestamp' :
				element.genType = element.decodeType = 'int' ;
				if ( ! element.length ) { element.length = 6 ; }
				element.auto = element.type ;
				break ;
			case 'increment8' :
				element.genType = element.decodeType = 'uint' ;
				element.length = 1 ;
				element.auto = element.type ;
				break ;
			case 'increment16' :
				element.genType = element.decodeType = 'uint' ;
				element.length = 2 ;
				element.auto = element.type ;
				break ;
			case 'increment24' :
				element.genType = element.decodeType = 'uint' ;
				element.length = 3 ;
				element.auto = element.type ;
				break ;
			case 'increment32' :
				element.genType = element.decodeType = 'uint' ;
				element.length = 4 ;
				element.auto = element.type ;
				break ;
			default :
				element.genType = element.decodeType = element.type ;
				element.auto = null ;
		}
		
		if ( typeof element.length !== 'number' || element.length !== Math.floor( element.length ) || element.length < 1 )
		{
			throw new TypeError( "[token-kit] .createTokenGenerator(), argument#0: bad token structure, it should be an Array of Object, having a 'length' property (positive integer)" ) ;
		}
		
		switch ( element.genType )
		{
			case 'int' :
			case 'uint' :
				if ( element.length > 6 )
				{
					throw new TypeError( "[token-kit] .createTokenGenerator(), 'length' property is too big (max 6 bytes for integer)" ) ;
				}
				break ;
			case 'BASE36' :
			case 'string' :
			case 'hex' :
			case 'buffer' :
				break ;
			default :
				throw new TypeError( "[token-kit] .createTokenGenerator(), unknown type: " + element.genType ) ;
		}
		
		generator.byteLength += element.length ;
	}
	
	generator.tokenLength = Math.ceil( generator.byteLength * 4 / 3 ) ;	// Base64: 33% of overhead
	//console.log( "byteLength:" , generator.byteLength , " tokenLength:" , generator.tokenLength ) ;
	generator.buffer = new Uint8Array( generator.byteLength ) ;
	generator.create = createToken.bind( generator ) ;
	generator.extract = extractFromToken.bind( generator ) ;
	
	return generator ;
} ;
	
	

function createToken( data )
{
	var i , iMax , element , pos = 0  , length ;
	
	if ( ! data || typeof data !== 'object' )
	{
		//data = {} ;
		throw new TypeError( '[token-kit] .createToken(), argument #0: bad token data, it should be an Object' ) ;
	}
	
	iMax = this.structure.length ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		element = this.structure[ i ] ;
		
		if ( element.auto )
		{
			switch ( element.auto )
			{
				case 'random' :
					data[ element.key ] = Math.floor( Math.random() * Math.pow( 2 , 8 * element.length ) ) ;
					break ;
				case 'timestamp' :
					if ( typeof data[ element.key ] !== 'number' ) { data[ element.key ] = 0 ; }
					
					switch ( element.length )
					{
						case 1 :
							data[ element.key ] += Math.floor( Date.now() / 31556925994 ) ;	// years since the unix epoch
							break ;
						case 2 :
							data[ element.key ] += Math.floor( Date.now() / 86400000 ) ;	// days since the unix epoch
							break ;
						case 2 :
							data[ element.key ] += Math.floor( Date.now() / 3600000 ) ;	// days since the unix epoch
							break ;
						case 3 :
							data[ element.key ] += Math.floor( Date.now() / 3600000 ) ;	// hours since the unix epoch
							break ;
						case 4 :
						case 5 :
							data[ element.key ] += Math.floor( Date.now() / 1000 ) ;	// seconds since the unix epoch
							break ;
						case 6 :
							data[ element.key ] += Date.now() ;	// ms since the unix epoch
							break ;
					}
					break ;
				case 'increment8' :
					data[ element.key ] = tokenAutoIncrement8 ;
					tokenAutoIncrement8 ++ ;
					if ( tokenAutoIncrement8 > MAX_UINT8 ) { tokenAutoIncrement8 = 0 ; }
					break ;
				case 'increment16' :
					data[ element.key ] = tokenAutoIncrement16 ;
					tokenAutoIncrement16 ++ ;
					if ( tokenAutoIncrement16 > MAX_UINT16 ) { tokenAutoIncrement16 = 0 ; }
					break ;
				case 'increment24' :
					data[ element.key ] = tokenAutoIncrement24 ;
					tokenAutoIncrement24 ++ ;
					if ( tokenAutoIncrement24 > MAX_UINT24 ) { tokenAutoIncrement24 = 0 ; }
					break ;
				case 'increment32' :
					data[ element.key ] = tokenAutoIncrement32 ;
					tokenAutoIncrement32 ++ ;
					if ( tokenAutoIncrement32 > MAX_UINT32 ) { tokenAutoIncrement32 = 0 ; }
					break ;
			}
		}
		
		switch ( element.genType )
		{
			case 'int' :
				u8Buffer.writeInt( this.buffer , data[ element.key ] , pos , element.length ) ;
				break ;
			case 'uint' :
				u8Buffer.writeUInt( this.buffer , data[ element.key ] , pos , element.length ) ;
				break ;
			case 'BASE36' :
				u8Buffer.writeUInt( this.buffer , parseInt( data[ element.key ] , 36 ) , pos , element.length ) ;
				break ;
			case 'string' :
				length = data[ element.key ].length ;
				
				// /!\ This should be done by uint8Kit /!\
				
				// Pad the string to the right with NUL if necessary
				// Actually, too much char are appended, if multybytes chars occurs, but this is not a big deal...
				while ( length < element.length )
				{
					data[ element.key ] += '\x00' ;
					length ++ ;
				}
				
				u8Buffer.writeUtf8( this.buffer , data[ element.key ] , pos , element.length ) ;
				break ;
			case 'hex' :
				u8Buffer.writeHex( this.buffer , data[ element.key ] , pos , element.length ) ;
				break ;
			case 'buffer' :
				u8Buffer.writeBuffer( this.buffer , data[ element.key ] , pos , element.length ) ;
				break ;
		}
		
		// Get the data cleaned for the user?
		if ( element.decodeType === 'base64url' )
		{
			data[ element.key ] = u8Buffer.readBase64Url( this.buffer , pos , element.length ) ;
		}
		
		pos += element.length ;
	}
	
	return u8Buffer.toString( this.buffer , 'base64url' ) ;
}



function extractFromToken( token )
{
	var i , iMax , element , pos = 0 , data = {} , indexOf ;
	
	if ( typeof token !== 'string' )
	{
		throw new TypeError( '[token-kit] .extractFromToken(): argument #0 should be a string' ) ;
	}
	
	if ( token.length !== this.tokenLength )
	{
		throw new Error( '[token-kit] .createToken(): argument #0 does not match the token length (expected: ' + this.tokenLength + ', actual: ' + token.length + ')' ) ;
	}
	
	iMax = this.structure.length ;
	
	u8Buffer.writeBase64Url( this.buffer , token , 0 , token.length ) ;
	
	for ( i = 0 ; i < iMax ; i ++ )
	{
		element = this.structure[ i ] ;
		
		switch ( element.decodeType )
		{
			case 'int' :
				data[ element.key ] = u8Buffer.readInt( this.buffer , pos , element.length ) ;
				break ;
			case 'uint' :
				data[ element.key ] = u8Buffer.readUInt( this.buffer , pos , element.length ) ;
				break ;
			case 'BASE36' :
				data[ element.key ] = u8Buffer.readUInt( this.buffer , pos , element.length ).toString( 36 ).toUpperCase() ;
				break ;
			case 'string' :
				data[ element.key ] = u8Buffer.readUtf8( this.buffer , pos , element.length ) ;
				indexOf = data[ element.key ].indexOf( '\x00' ) ;
				if ( indexOf !== -1 ) { data[ element.key ] = data[ element.key ].slice( 0 , indexOf ) ; }
				break ;
			case 'hex' :
				data[ element.key ] = u8Buffer.readHex( this.buffer , pos , element.length ) ;
				break ;
			case 'base64url' :
				data[ element.key ] = u8Buffer.readBase64Url( this.buffer , pos , element.length ) ;
				break ;
		}
		
		pos += element.length ;
	}
	
	return data ;
}


