/*
	Token Kit
	
	Copyright (c) 2014 - 2016 Cédric Ronvel
	
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

/* jshint unused:false */
/* global describe, it, before, after */

"use strict" ;



var tokenKit = require( '../lib/token-kit.js' ) ;
var expect = require( 'expect.js' ) ;





			/* Tests */



describe( "createToken()" , function() {
	
	it( "should create a token" , function() {
		
		var tokenStructure = [
			{ key: 'expirationTime' , type: 'timestamp' , length: 4 } ,
			{ key: 'increment' , type: 'increment16' } ,
			{ key: 'random' , type: 'random' , length: 3 } ,
			{ key: 'duration' , type: 'uint' , length: 2 } ,
			{ key: 'type' , type: 'BASE36' , length: 2 } ,
		] ;
		
		var gen = tokenKit( tokenStructure ) ;
		
		var test = function( data ) {
			console.log( "\n###\nData:" , data ) ;
			var token = gen.create( data ) ;
			console.log( "Data after create():" , data ) ;
			console.log( "Token:" , token ) ;
			var extracted = gen.extract( token ) ;
			console.log( "Extracted:" , extracted ) ;
			expect( extracted ).to.eql( data ) ;
		} ;
		
		test( { duration: 300 , type: 'H' } ) ;
		test( { duration: 600 , type: 'QS' } ) ;
		test( { duration: 3600 , type: 'CK' } ) ;
	} ) ;
	
	it( "should create a token²" , function() {
		
		var tokenStructure = [
			{ key: 'expirationTime' , type: 'timestamp' , length: 4 } , // in seconds
			{ key: 'userId' , type: 'hex' , length: 12 } ,  // MongoId: 12 bytes, 24 hex chars
			{ key: 'agentId' , type: 'hex' , length: 5 } ,  // 10 hex chars
			{ key: 'increment' , type: 'increment8' } ,   
			{ key: 'type' , type: 'BASE36' , length: 2 }
		] ;
		
		var gen = tokenKit( tokenStructure ) ;
		
		var test = function( data ) {
			console.log( "\n###\nData:" , data ) ;
			var token = gen.create( data ) ;
			console.log( "Data after create():" , data ) ;
			console.log( "Token:" , token ) ;
			var extracted = gen.extract( token ) ;
			console.log( "Extracted:" , extracted ) ;
			expect( extracted ).to.eql( data ) ;
		} ;
		
		test( { expirationTime: 300 , type: 'H' , userId: '0123456789abcdef01234567' , agentId: '0123456789' } ) ;
		test( { expirationTime: 600 , type: 'QS' , userId: '0123456789abcdef01234567' , agentId: '0123456789' } ) ;
		test( { expirationTime: 3600 , type: 'CK' , userId: '0123456789abcdef01234567' , agentId: '0123456789' } ) ;
	} ) ;
} ) ;

