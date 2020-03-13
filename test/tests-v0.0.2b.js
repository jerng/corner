import * as Serl from   '../lib/serl.js'
import * as SSON from   '../lib/sson/sson.js'
import * as Exam from '../lib/classes/exam.js'

new Exam.Exam ( { 
    config : {
        expand : {
            initialContext : true,
            tests : {
                legibility : true,
            },
            unexpectedCode : false
        }
    },
    concerns : [ 
{   warning: `Eruda web console doesn't show inenumerable props. Fork and fix Eruda.`
},
{   warning: `Perhaps a lot of props of values in the graph should be inenumerable. However, until we write a utlity function to recursively list all enumerables up the prototype chain, we can develop using enumerable properties except when fundamentally dysfunctional.`
},
{   test : `Build a reactive datastore, where each datum is represented by a Proc instance.`,
    code : function () {

/*******************************************************************************
 *
 *  Abstract Data [ Model @ Graph ]
 *
 *  -   [ Entities @ Addresses @ Predicates ] which are spatio-temporally Discrete
 *
 *      1.  [ Data @ Values ] as [ Nodes @ Vertices ]
 *
 *      2.  [ Dependencies @ Causalities ] 
 *              as [ Arrows @ Directed Edges] between Datum
 *
 *          -   The following expressions are (roughly) equivalent:
 *
 *              -   'Y depends on X' 
 *              -   'X determines Y' 
 *              -   'X supervenes on Y' 
 *              -   'there is an arrow from X to Y' 
 *              -   'changes in X, cause changes in Y' 
 *              -
 *              -   'there is a causal function, F, from X to Y'
 *                      (X is its domain, and Y its codomain)
 *
 *              -   'changes in X, imply changes in Y'
 *              -   'a change in X, necessitates an update of Y'
 *                      (this update may, or may not, 
 *                       result in the same value of Y)
 *
 *          -   The following expressions are (roughly) equivalent:
 *
 *              -   'A is equivalent to B' 
 *              -   'there is a two-way dependency, between A and B'
 *              -   'there are two opposing arrows, between A and B'
 *              -   'a change in A necessites an update of B, and, 
 *                      a change in B necessitates an update of A'
 *
 *  -   Existential Quantification of a Discrete Entity.
 *
 *      1.  [ Creation @ Existentialisation ]
 *
 *      2.  [ Deletion @ Uncreation @ Destruction]
 *
 *  -   [ Qualifying @ Copying ] Operations may be performed,
 *          only between two Entities which Exist
 *
 *      3a. [ Reading @ Evaluation @ Getting ] is a copying of values,
 *              from a remote Address (typically a Machine), 
 *              to a local Address (typically a User).
 *
 *      3b. [ Updating @ Writing @ Setting @ Modifying ] is a copying of values,
 *              from a local Address (typically a User),
 *              to a remote Address (typically a Machine).
 *
 *  -   The acronym, CRUD ( Create, Read, Update, Delete), is conventional.
 *  
 *  -   (Discuss) Reading and Updating are basically the same operation, but in
 *      different directions. The main difference is that because the flow
 *      teleology is User-centric (describes User intent), there arises an
 *      asymmetry between Reading and Updating, whereby 
 *
 *      -   Reading ASSUMES the staleness of the User's data, and therefore
 *          performs dependency check and reevaluation, of the remote data,
 *          whereas,
 *
 *      -   Updating ASSUMES the staleness of the remote data, and therefore
 *          performs no dependency check and reevaluation of the local data,
 *
 *  -   (Discuss) Creating may be viewed simply as the first Update event. 
 *
 *  -   (Sketch) Given two types of Entity, and three types of event, we should need
 *      six ( 6 = 2 * 3 ) blocks of code to implement this model.
 *      Additionally, we have to pipe the Qualifying Operation to two sets
 *      of syntax, respectively for 3a. and 3b.
 *
 ******************************************************************************/


        let graph = {
            vertices : {}  // consider upgrade to WeakMap (TODO)
        }

    /////////////////////////////////////////////////////////////////
    //
    //      1.  Approach using 'a prop key' as the datum key, then defining
    //          properties on the value.
    //    
    //          This however, requires that we coerce all primitives 'string's,
    //          'boolean's, and 'number's to objects.  This would result in
    //          large performance losses under the hood, and users may not know
    //          why their data operations are so non-performant.
    //          
    //          But it completely fails for 'undefined' and 'null'. So we cannot
    //         
    //  Object.defineProperty ( graph.vertices, 'a prop key', {
    //      value       : new String ('a prop value'),
    //                              // specification default : undefined
    //      configurable: false,    // specification default : false    
    //      enumerable  : false,    // specification default : false    
    //      writable    : true      // specification default : false     
    //  } )
    //  Object.defineProperty ( graph.vertices['a prop key'], 'a meta prop key', {
    //      value       : 'a meta prop value',
    //      configurable: false,    
    //      enumerable  : false,    
    //      writable    : true      
    //  } )
    //
    //  console.log ( graph.vertices['a prop key'] ) 
    //
    /////////////////////////////////////////////////////////////////

    /////////////////////////////////////////////////////////////////
    //
    //      2.  Approach with an extra layer of indirection. 'a prop key' now
    //          refers to an object. The value of 'a prop key' is stored in a
    //          subprop called 'datum' because we don't want to be confusing
    //          and name the prop 'value'. We might alternatively call it 'real
    //          value', 'really', or 'actually'...
    //
    //          graph.vertices.datum

        graph.vertices['a prop key'] = {}

        Object.defineProperty ( graph.vertices['a prop key'], 'datum', {
            configurable: false,    // specification default : false    
            enumerable  : true,     // specification default : false    
            writable    : true,     // specification default : false     
            value       : 'a prop value',
                                    // specification default : undefined
        } )

    //      2.1.    As this seems to be satisfactory so far, we proceed to add a
    //          log to this vertice. Upon its creation, a vertice can log its
    //          first update. Upon deletion, a vertice can log a soft-delete
    //          date.
    //              
    //          As this seems to be satisfactory so far, we proceed to a cache
    //          to this vertice. The cache has a log, enabling playback of a
    //          datum's history - if logging is enabled, this might eat up
    //          memory very quickly with frequently modified datum, such as UI
    //          data.
    //
    //          graph.vertices.datum.log

        Object.defineProperty ( graph.vertices['a prop key'], 'log', {
            configurable : false,    
            enumerable   : true,    
            writable     : true,     
            value        : {            // Examples of data structure:

                reads   : [ 
                    (   performance.timeOrigin
                        ||  performance.timing.navigationStart 
                    ) + performance.now()
                ], 

                updates : [ 
                    [   
                        (   performance.timeOrigin
                            ||  performance.timing.navigationStart 
                        ) + performance.now(), 
                        
                        'the relevant prop value'
                    ] 
                ],

                deletes : [ 
                    [   
                        (   performance.timeOrigin
                            ||  performance.timing.navigationStart 
                        ) + performance.now(), 
                        
                        'the relevant prop value'
                    ] 
                ],
            },
        } )

    //      2.2.    Assuming that all is well with the first two props, we now
    //          can consider adding a cache. But since the 'datum's have not
    //          been described to hold computed values, the computation time of
    //          any datum should be 0, and so a cache would be pointles. First
    //          we should add computability of values.
    //
    //          graph.vertices.datum.algo

        Object.defineProperty ( graph.vertices['a prop key'], 'algo', {
            configurable : false,    
            enumerable   : true,    
            writable     : true,     
            value        : () => 1 + 2   // some kind of function
        } )

    //      2.3.    This suffices for computations which do not depend on other
    //          data. In order to point to other data in the graph, we need to
    //          start storing arrows between vertices. For starters, we'll only
    //          store the 'in arrows' because we want to know what data are used
    //          in the computation of this datum. But later we may want to
    //          automatically 'push' updates to any data whose computations
    //          depend on this datum, so we will have to store the 'out arrows'
    //          also.
        
        Object.defineProperty ( graph.vertices['a prop key'], 'arrows', {
            configurable : false,    
            enumerable   : true,    
            writable     : true,     
            value        : {

                ins  : [

                    {   ikey    : 'another prop key',
                        reads   : [ 
                            (   performance.timeOrigin
                                ||  performance.timing.navigationStart 
                            ) + performance.now()
                        ], 

                        updates : [ 
                            [   
                                (   performance.timeOrigin
                                    ||  performance.timing.navigationStart 
                                ) + performance.now(), 
                                
                                'the relevant prop value'
                            ] 
                        ],

                        deletes : [ 
                            [   
                                (   performance.timeOrigin
                                    ||  performance.timing.navigationStart 
                                ) + performance.now(), 
                                
                                'the relevant prop value'
                            ] 
                        ],
                    }

                ],
                outs : [ 

                    {   okey    : 'another prop key',
                        reads   : [ 
                            (   performance.timeOrigin
                                ||  performance.timing.navigationStart 
                            ) + performance.now()
                        ], 

                        updates : [ 
                            [   
                                (   performance.timeOrigin
                                    ||  performance.timing.navigationStart 
                                ) + performance.now(), 
                                
                                'the relevant prop value'
                            ] 
                        ],

                        deletes : [ 
                            [   
                                (   performance.timeOrigin
                                    ||  performance.timing.navigationStart 
                                ) + performance.now(), 
                                
                                'the relevant prop value'
                            ] 
                        ],
                    }

                ]
            } 
        } )

    //      2.4.    Now that we can traverse vertices via arrows, it is
    //          reasonable to believe that some value computations will be
    //          expensive, and so we may want to have a cache boolean, which 
    //          allows stale values to be marked, without recomputing them
    //          immediately.
        
        Object.defineProperty ( graph.vertices['a prop key'], 'cache', {
            configurable : false,    
            enumerable   : true,    
            writable     : true,     
            value        : {        // Examples of data structure:
                stale   : false,
                hits    : [ 
                    (   performance.timeOrigin
                        ||  performance.timing.navigationStart 
                    ) + performance.now()
                ],
                misses  : [ 
                    (   performance.timeOrigin
                        ||  performance.timing.navigationStart 
                    ) + performance.now()
                ]
            } 
        } )

    //      If we accept the data structure as it is so far, then we can proceed
    //      to discuss design of the operating structure, i.e. chronological
    //      processes, in this system.
    //
    //      3.1.    Creating a Vertice  OK 
    //      3.2.    Reading a Vertice   x
    //      3.3.    Updating a Vertice  x
    //      3.4.    Deleting a Vertice  x
    //
    //      4.1.    Creating an Arrow   x
    //      4.2.    Reading an Arrow    x
    //      4.3.    Updating an Arrow   x
    //      4.4.    Deleting an Arrow   x

class Graph {

    // A graph server, actually.


    // SECOND ATTEMPT:
    updateVertice ( ... args ) {

        let datum

        switch ( args.length ) 
        {
            case 1:

                datum = new Datum ( args[0] )
                this.vertices [ datum.key ] = datum 

                // redundant check?
                if ( this.vertices [ datum.key ].value !== args[0] ) {
                    throw Error (`Graph::updateVertice/1 called, update failed.`)
                }
                break

            case 2:

                datum = new Datum ( { [ args[0] ] : args[1] } )
                this.vertices [ datum.key ] = datum 

                // redundant check?
                return  ( this.vertices [ datum.key ].value == args[1] ) 
                        ? true
                        : false

            default:
                throw Error (`Graph::updateVertice/n was called, where n's branch remained undefined `)
        }
    }

    //  Graph()
    constructor ( node ) {

        // initialisers
        this.vertices   = {} 
        this.parentKey  = Symbol()
        
        // aliases
        //this.c = this.createVertice 

        if ( ! ( node instanceof Serl.Node ) ) {
            
            // throw Error ( `Graph::constructor() called, first argument was not an instance of Serl.Node.` )
            
            node = new Serl.Node ( 'node created by Graph::constructor()' )
        }
        
        let graphReturner = () => this

        let graphServerHandler = {

            // graphServerHandler
            apply : function( targGraphReturner, thisArg, args) { 
            
                return targGraphReturner() // the Graph instance
            
            },



            // graphServerHandler
            get : function( targGraphReturner, prop, rcvr ) {
                // reflect.get ( targ, prop, rcvr )

// Values which are not objects, which will throw an error if you try
// to read their properties : null, undefined, 
        
                let graph = targGraphReturner()
                
console.log (`graphServerHandler.get : Try to get the vertice (${prop}).`)

                if ( ! ( prop in graph.vertices ) )
                { return undefined } 

                // Wherein. if we find that the user has previously set an
                // object as the value, we try to intercept the call to that
                // object's properties...
                else 
                if  (   ( typeof graph.vertices[ prop ].value !== 'object' )
                        || 
                        ( !( graph.parentKey in graph.vertices[ prop ].value ) )
                    ) 
                { return graph.vertices[ prop ].value } 

                else {
                    //  Implicitly, 
                    //      graph.vertices[ prop ].value[ graph.parentKey ]
                    //  ... is set.
console.log ( `graphServerHandler.get found a parentkey in (${prop})`)

                    return graph.vertices[ prop ].value
                }


            },



            // graphServerHandler
            set : function( targGraphReturner, prop, val, rcvr) {
                // reflect.set ( targ, prop, val, rcvr )

                //  Update Datum
                //   L> Create Datum

                // TODO: consider, enabling arrow creation via ['->'] or
                // ['$pointsTo']

                let graph = targGraphReturner()
                let success

console.log ( `graphServerHandler.set : Try to set the vertice (${prop}) to (${val}).` ) 


                // Wherein, if we find the user trying to set an object as the
                // value, we want to intercept future calls to that object's
                // properties...
                if ( typeof val == 'object' ) {

                    let valReturner = () => val
                        // Because we want to Proxy this, and have an (apply)
                        // handler: the proxied value must be a function.

                    // IMPORTANT - subObject mark created
                    valReturner[ graph.parentKey ] = prop

console.log ( `graphServerHandler.set : set a Symbol Key (value = parentKey) in the value of the
vertice (${prop}); note that this value is stored in the (address.value) as (Proxy ( ()=> value) )` ) 

                    let verticeValueHandler = {


                            //  When, a SERVER.key() is called...
                            //  ... it refers to the underlying Graph object,
                            //  and looks at... 
                            //
                            //      graph.vertices['key'] => a Datum    
                            //      
                            //  ... where...
                            //
                            //      datum.value
                            //
                            //  ... may be  (1.) a non-object, or
                            //              (2.) a Proxy
                            //
                            //  ... where the proxy's target is a valReturner of
                            //  the form...
                            //
                            //      () => val
                            //
                            //  ... where...
                            //
                            //      valReturner[graph.parentKey] => 'key'
                            //
                            //  ... a Symbol key may or may not be set which,
                            //  WHEN SET, marks the val as an object which has
                            //  properties tracked in the graph via compound
                            //  keys of the form...
                            //
                            //      graph.vertices[ 'key' + '.' + subKey ]
                            //
                            //////////////////////////////////////////////////

                        // verticeValueHandler
                        apply : function( targVerticeValReturner, thisArg, args) { 

                            //////////////////////////////////////////////////
                            //
                            //  ** BASED ON THE CONTEXT GIVEN ABOVE **
                            //
                            //  This code runs upon calls of the form:
                            //
                            //      SERVER.key.subKey.subSubKey()
                            //
                            //  ... where ...
                            //
                            //  thisArg is the proxied parent valReturner, where...
                            //
                            //              valReturner[graph.parentKey] => 
                            //                  'key.subKey'
                            //  ;
                            //  targ    is the child valReturner, where ...
                            //
                            //              valReturner[graph.parentKey] =>
                            //                  'key.subKey.subSubKey'
                            //  ;
                            //
                            //  targ()  will return the value of the "original
                            //          object" set at...
                            //
                            //              graph.vertices['key.subKey']
                            //  ;
                            //
                            //  ... and here what we want the code to do, is
                            //  to take the "original object", update it based
                            //  on those of its properties were tracked by the
                            //  graph, and then to return the updated object to
                            //  the user.
                            
console.log ( `verticeValueHandler.apply : ` )                          
console.log ( targVerticeValReturner[graph.parentKey] )

                            let initial         =   targVerticeValReturner()                         
                            let tempGraphServer =   new Proxy ( 
                                                            graphReturner, 
                                                            graphServerHandler 
                                                        )
                            let subKeys         =   
                                Object
                                    .keys ( graph.vertices )
                                    .reduce (

    (acc, cur, ind, arr) => 
    {
        if (cur.startsWith ( targVerticeValReturner[ graph.parentKey ] + '.') ) 
        {   
            let key = cur.slice (
                targVerticeValReturner[graph.parentKey].length + 1
            )
            if ( ! key.includes ( '.') )
            {
                acc[key] =  (   ( typeof tempGraphServer[cur] == 'function' )
                                &&
                                ( graph.parentKey in tempGraphServer[cur] )
                            )   
                            ? tempGraphServer[cur]() 
                            : tempGraphServer[cur]
            }
        }
        return acc
        
    }
    
                            , initial ) // reduce()

                            return initial
                        },

                        // verticeValueHandler
                        get : function( targVerticeValReturner, prop, rcvr ) {

//console.log ( `verticeValueHandler.get's target :`)
//console.log ( targ )
console.group ( `verticeValueHandler.get's receiver :`)
console.log ( rcvr )
console.groupEnd ( `verticeValueHandler.get's receiver :`)

console.log ( `verticeValueHandler.get the prop:  ${prop}` )

                            // IMPORTANT - subObject mark read
                            if ( graph.parentKey in targVerticeValReturner ) {
//console.log ( `verticeValueHandler.get found a parentKey in the (targ) argument` )
                                
                                let compoundKey =
                                        targVerticeValReturner[ graph.parentKey ]
                                        + '.'
                                        + prop

console.group (`verticeValueHandler.get: will get a compoundKeyed vertice (${compoundKey}) :`)
console.log ( graph.vertices[ compoundKey ] )
console.groupEnd (`verticeValueHandler.get: will get a compoundKeyed vertice (${compoundKey}) :`)

                                return ( compoundKey in graph.vertices )
                                    ? graph.vertices[ compoundKey ].value
                                    : undefined
                            }

                            else { return targVerticeValReturner[ prop ] }
                        },



                        // verticeValueHandler
                        set : function( targVerticeValReturner, prop, val, rcvr) {
console.log (`verticeValueHandler.set the prop : (${prop})`)

                            // IMPORTANT - subObject mark read
                            if ( graph.parentKey in targVerticeValReturner ) {
                                
console.log (`verticeValueHandler.set:  found a parentKey in (${targVerticeValReturner})`)
                                let compoundKey = 
                                        targVerticeValReturner[ graph.parentKey ]
                                        + '.'
                                        + prop
                                
                                let success

                                // this code seems redundant, with
                                // graphServerHandler's code, but we'll just
                                // roll with it for now...
                                if ( typeof val == 'object' ) {
                                    
                                    let valReturner = () => val
                                // Because we want to Proxy this, and have an (apply)
                                // handler: the proxied value must be a function.
                                // IMPORTANT - subObject mark created

                                    valReturner[ graph.parentKey ] = compoundKey 

                                    success = g.updateVertice ( 
                                        compoundKey, 
                                        new Proxy ( valReturner, verticeValueHandler )
                                    )
console.log (`verticeValueHandler.set: set a compoundKey (${compoundKey}) with a proxied value`)
                                }
                                else { 
                                    success 
                                        = g.updateVertice ( compoundKey, val )

console.log (`verticeValueHandler.set: set a compoundKey (${compoundKey}) with a non-object`)
                                } 
                               
                                return success

                            } 
                            
                            else {
                            
                                targVerticeValReturner[ prop ] = val

                                // redundant check?
                                return  targVerticeValReturner[ prop ] == val
                            }
                        
                        } // verticeValueHandler.set

                    } // verticeValueHandler

                    success =   g.updateVertice (   
                                    prop,
                                    new Proxy ( valReturner, verticeValueHandler )
                                ) // FIXME UNCERTAIN CHANGES 
                
                } // graphServerHandler.set, if ( typeof val == 'object' )
                
                
                else { success = g.updateVertice ( prop, val ) }

                return success // throws an error if falsy
            
            } // graphServerHandler.set
        
        } // graphServerHandler


        return  {   serlNode    : node, 
                    graph       : this,
                    graphServer : new Proxy ( graphReturner, graphServerHandler ) }
    }

}

    /*  End-developer variables that are reactive (has dependencies; dependent
     *  on other variables) or active (has dependents; determining on other
     *  variables), should be instances of this class.
     *
     *  Each Datum must be associated with one, and only one instance of the
     *  Graph class.
     *
     *  When a Datum is created, it must know its Graph, and its Graph must know
     *  it.
     *
     *  When a Datum is set or gotten, its Graph must be consulted.
     *  
     *  When a Datum is deleted, its Graph must know it.
     *  
     *  If a Datum's value is algorithmic, its must traverse its Graph by
     *  following its Arrows, to determine its value.
     *  
     *  Arrows are stored in each Datum.
     *  
     *  Graphs are abstract entities... and reified only by the ability of Datum
     *  to follow their Arrows in tracking down other Datum.
     *  
     *  
     *  
     */

    /** Example data:

            "log": {
                "reads": [
                    1583344147570.897
                ],
                "updates": [
                    [
                        1583344147570.9019,
                        "the relevant prop value"
                    ]
                ],
                "deletes": [
                    [
                        1583344147570.9019,
                        "the relevant prop value"
                    ]
                ]
            },
    */

    /** Example data:

            "algo": {
                "_serlType": 5,
                "v": "() => 1 + 2"
            },
    */

    /** Example data:

            "arrows": {
                "ins": [
                    {
                        "ikey": "another prop key",
                        "reads": [
                            1583344147570.9219
                        ],
                        "updates": [
                            [
                                1583344147570.9219,
                                "the relevant prop value"
                            ]
                        ],
                        "deletes": [
                            [
                                1583344147570.9219,
                                "the relevant prop value"
                            ]
                        ]
                    }
                ],
                "outs": [
                    {
                        "okey": "another prop key",
                        "reads": [
                            1583344147570.9268
                        ],
                        "updates": [
                            [
                                1583344147570.932,
                                "the relevant prop value"
                            ]
                        ],
                        "deletes": [
                            [
                                1583344147570.9368,
                                "the relevant prop value"
                            ]
                        ]
                    }
                ]
            },
    */

    /** Example data:

            "cache": {
                "stale": false,
                "hits": [
                    1583344147570.9368
                ],
                "misses": [
                    1583344147570.942
                ]
            }
    */

class Datum {

    constructor ( ...args ) {
  
        // initialisers
        this.key
        this.value
        this.algo

        this.arrows     = {
            ins     : [],
            outs    : []
        }

        this.log        = {
            reads   : [],
            updates : [],
            deletes : []
        }

        this.cache      = {
            stale   : false,
            hits    : [],
            misses  : []
        }

        switch ( args.length )
        {
            case 1 :
                switch ( typeof args[0] ) 
                {
                    case 'string':
                        this.key = args[0]
                        return this

                    case 'object':
                        this.key = Object.keys( args[0] )[0]
                        this.value = args[0][this.key]
                        return this

                    default:
                        throw Error (`Datum::constructor/1 called on n, where
                        (typeof n) is not 'string' or 'object';  branch undefined`)
                }
            default:
                throw Error (`Datum::constructor/n called, branch for this arity is undefined.`)
        }
    }
}


        let {   serlNode    : node, 
                graph       : g,
                graphServer : SERVER } = new Graph 

console.group ('3.0.    Creating a graph server')

    console.log ( SERVER )      //  a proxy around the Graph object
    console.log ( SERVER() )    //  the Graph object
    console.log ( g )           //  the Graph object
    console.log ( g.vertices )  //  empty object 

console.groupEnd ('3.0.    Creating a graph server')

{   console.group ('3.1.    Creating a Vertice  OK ')

    {   console.groupCollapsed ( `3.1.0. no namespaces` )
        console.log ( SERVER.location )
            // undefined key

        console.log ( ( SERVER.location = 'Malaysia' ) )    
            // '=' evaluates to the assigned value

        console.log ( SERVER.location )     
            // 'Malaysia' 

        console.log ( SERVER.testundefined = undefined )     
            // '=' evaluates to the assigned value

        console.log ( SERVER.testundefined )     
            // undefined

        console.log ( SERVER.address = {} )
            // evaluates to the final, proxy-handled, assigned value 

            //  DEV:
            //      When the subObject {} is set, it is also given a symbol key,
            //          
            //          [graph.parentKey] = 'address'

        console.groupEnd ( `3.1.0. no namespaces` )
    }
       
    {   console.groupCollapsed ('3.1.1.    Creating a name-spaced Vertice (depth=1) OK ')

        {   //  Expect error:

        //  console.log ( SERVER.location.sublocation = 'Puchong' )
        //  let a = { b : 'hi' }

        //  a.b.c = 'bye'
                // throws an error in strict mode; 
                // fails silently in non-strict mode, while evaluating to 'bye'
        }

        {   console.group (`trying to set the value of a subObject`)
            console.warn ( `SERVER.address.street = 'Jalan 1' : ${SERVER.address.street = 'Jalan 1'}` )
                // evaluates to the assigned value 
            console.groupEnd (`trying to set the value of a subObject`)
        }

        {   console.group (`trying to get the value of a subObject`)
            console.warn ( `SERVER.address.street : ${SERVER.address.street}` )
            console.groupEnd (`trying to get the value of a subObject`)
        }
        console.groupEnd ('3.1.1.    Creating a name-spaced Vertice (depth=1) OK ')
    }
        
    {   console.group ('3.1.2.    Creating a name-spaced Vertice (depth>1) OK')

        {   console.groupCollapsed (`trying to set the value of a subSubObject`)

            console.warn ( `SERVER.address.unit = {} : ${SERVER.address.unit = {}}` )
                // evaluates to the assigned value 
                //
                // Questionable behaviour.

            console.warn ( `SERVER.address.unit.part1 = 'The' : ${
                SERVER.address.unit.part1 = 'The'
            }` )

            console.groupEnd (`trying to set the value of a subSubObject`)
        }

        {   console.groupCollapsed (`trying to get the value of a subSubObject`)
            console.log ( `SERVER.address.unit.part1 : ${SERVER.address.unit.part1}` )
            console.groupEnd (`trying to get the value of a subSubObject`)
        }

        {   console.groupCollapsed (`deeper still?`) 
        
            // each of these below is a discrete test
            
            //
            console.warn ( 
                SERVER.function0 = () => 'function0 has returned'
            )
            console.warn ( SERVER.function0() )

            //
            console.warn ( 
                SERVER.address.function1 = () => 'function1 has returned'
            )
            console.warn ( SERVER.address.function1() )

            //
            console.warn ( 
                SERVER.address.unit.function2 = () => 'function2 has returned'
            )
            console.warn ( SERVER.address.unit.function2() )

            //
            SERVER.address.unit.part2 = {}
            SERVER.address.unit.part2.somethingElse = 'Home'
            SERVER.address.unit.part2.part2a = {}
            SERVER.address.unit.part2.part2a.deeperKey = '1,2,3 here is a deeper key'
            
            //
            console.warn ( SERVER.address.unit.part2.somethingElse )
            
            //
            console.warn ( SERVER.address.unit.part2.undefinedKey )
            
            console.groupEnd (`deeper still?`)
        }

        {   console.groupCollapsed (`Tree-extraction from the graph server`) 
            
            //
            console.warn ( SERVER.address.unit.part2 )
            
            //
            console.warn ( SERVER.address.unit.part2() )

            console.groupEnd (`Tree-extraction from the graph server`) 
        }

        {   console.groupCollapsed (`Assigning from the graph server?`) 

            //
            let someVar = SERVER.address.unit.part2
            
            //
            console.warn ( 
                `These expressions return the proxied values`,
                someVar, 
                someVar.part2a 
            )

            //
            console.warn ( 
                `These expressions return the extracted trees`, 
                someVar(),
                someVar.part2a()
            )
            
            //
            console.warn ( 
                `This expression returns a simple value`,
                someVar.part2a.deeperKey 
            )  

            console.groupEnd (`Assigning from the graph server?`) 
        }
        console.groupEnd ('3.1.2.    Creating a name-spaced Vertice (depth>1) OK')
    }

    console.group ('3.1.3.    Tree-insertion into the graph server')
    console.groupEnd ('3.1.3.    Tree-insertion into the graph server')

    {   console.error ( `WIP HERE` ) 
        console.log ( SERVER().vertices )  
    }
    console.groupEnd ('3.1.    Creating a Vertice  OK ')
}

console.warn (`3.1. What about when you set a deep object, and try to get its deep fields later?`)
console.warn (`3.1. What about when you set another variable, to refer to a gs or a gs vertice?`)

console.warn('3.2.    Reading a Vertice   x')
/*      
        console.log ( {
            d1:d1,
            d2:d2,
            d3:d3,
            d4:d4,
            d5:d5,
            d6:d6
        })

//        console.log ( d2 )
//*/

console.warn('3.3.    Updating a Vertice  x')

console.warn('3.4.    Deleting a Vertice  x')

console.group('4.1.    Creating an Arrow   x')
console.groupEnd('4.1.    Creating an Arrow   x')

console.warn('4.2.    Reading an Arrow    x')
console.warn('4.3.    Updating an Arrow   x')
console.warn('4.4.    Deleting an Arrow   x')



        return  'placeholder'

    }, // code
    want : 'legible'
},


/* Templates: 

{   test : ``,
    code : function () {
    }
},

{   test : ``,
    expectError : true,
    code : function () {
    }
},

{   warning : ``,
},
*/
    ] } )

///////////////////////////////////////////////////////////////////////////////
/*  

    Discussion on eDX / end-developer experience scenarios, and how we end up
    using the Proxy class:

///////////////////////////////////////////////////////////////////////////////

    //  (1.) If we were to state,

            let someObject      = { someProp : {}, someOtherProp : 2 }
            let someVar         = someObject.someProp
            let someOtherVar    = someObject.someOtherProp

    //  ... then we could change someObject's props behind the scenes, and
    //  thereby
    //
    //  we could cause our variousVars to behave reactively. This would be
    //  achieved simply by adjusting the getters and setters of someObject on a
    //  per-prop basis. 
    //  
    //  The following expression, 

        {
            ( someObject.someProp.subPropOfSomeProp = 'a value' )
            &&
            Object.is (     someVar.subPropOfSomeProp, 
                            someObject.someProp.subPropOfSomeProp
                      )
        }

    //  ... would then be true. And furthermore, you could state,

            someVar.anotherSubPropOfSomeProp = 3
            console.log ( someObject.someProp.anotherSubPropOfSomeProp )

    //  ... and get '3'.
      
///////////////////////////////////////////////////////////////////////////////

    //  (2.) If we were to state,

            let someObject      = { someProp : {} }

            Object.defineProperty ( someObject, 'someProp', { set :  
                function ( value ) { this[ '_someProp' ] = value }
            } )

            Object.defineProperty ( someObject, 'someProp', { get :  
                function () { return this[ '_someProp' ] }
            } )

    //  ... then the getter's return value of someObject.someProp is no longer
    //  an object, and therefore stating,

            someObject.someProp = 5
            let someVar         = someObject.someProp
            console.log ( someVar, someObject.someProp ) 

    //  ... has passed to someVar (by value) only the output of the getter,

            someObject.someProp = 7
            console.log ( someVar, someObject.someProp ) 

    //  ... and likewise, assignig a value to someVar will not trigger the
    //  setter of someObject.someProp

            someVar = 9
            console.log ( someVar, someObject.someProp ) 

///////////////////////////////////////////////////////////////////////////////

    //  (3.) If we were to state,

            let someObject = { someProp : {  } } 

            Object.defineProperties ( 
                someObject.someProp, { 

                    'subPropOfSomeProp' : { 

                        'set' : function ( value ) { 
                            console.log ('setter')
                            this[ '_subPropOfSomeProp' ] = value 
                        },
                        'get' : function () { 
                            return this[ '_subPropOfSomeProp' ]
                        }
                    } 
                } 
            )
            
            let someVar         = someObject.someProp

    //  ... we would then be able to write getters and setters for
    //  someVar.anotherSubPropOfSomeProp.
    
            someVar.subPropOfSomeProp = {}      // does triggers the setter
            someVar.subPropOfSomeProp.new = 1   // does not! 

    //  ... so as it turns out, we still can't intercept key creation, using
    //  setters on the parent object. We might as well stick with (1.) above.

///////////////////////////////////////////////////////////////////////////////

    //  (4.)We now turn to the Proxy class, which allows us to intercept key
    //  creation on Proxied variables.



///////////////////////////////////////////////////////////////////////////////
    

            


*/














