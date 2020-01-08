// Lockr
!function(root,factory){"undefined"!=typeof exports?"undefined"!=typeof module&&module.exports&&(exports=module.exports=factory(root,exports)):"function"==typeof define&&define.amd?define(["exports"],function(exports){root.Lockr=factory(root,exports)}):root.Lockr=factory(root,{})}(this,function(root,Lockr){"use strict";return Array.prototype.indexOf||(Array.prototype.indexOf=function(elt){var len=this.length>>>0,from=Number(arguments[1])||0;for(from=from<0?Math.ceil(from):Math.floor(from),from<0&&(from+=len);from<len;from++)if(from in this&&this[from]===elt)return from;return-1}),Lockr.prefix="",Lockr._getPrefixedKey=function(key,options){return options=options||{},options.noPrefix?key:this.prefix+key},Lockr.set=function(key,value,options){var query_key=this._getPrefixedKey(key,options);try{localStorage.setItem(query_key,JSON.stringify({data:value}))}catch(e){console&&console.warn("Lockr didn't successfully save the '{"+key+": "+value+"}' pair, because the localStorage is full.")}},Lockr.get=function(key,missing,options){var value,query_key=this._getPrefixedKey(key,options);try{value=JSON.parse(localStorage.getItem(query_key))}catch(e){value=localStorage[query_key]?{data:localStorage.getItem(query_key)}:null}return null===value?missing:"object"==typeof value&&"undefined"!=typeof value.data?value.data:missing},Lockr.sadd=function(key,value,options){var json,query_key=this._getPrefixedKey(key,options),values=Lockr.smembers(key);if(values.indexOf(value)>-1)return null;try{values.push(value),json=JSON.stringify({data:values}),localStorage.setItem(query_key,json)}catch(e){console.log(e),console&&console.warn("Lockr didn't successfully add the "+value+" to "+key+" set, because the localStorage is full.")}},Lockr.smembers=function(key,options){var value,query_key=this._getPrefixedKey(key,options);try{value=JSON.parse(localStorage.getItem(query_key))}catch(e){value=null}return null===value?[]:value.data||[]},Lockr.sismember=function(key,value,options){return Lockr.smembers(key).indexOf(value)>-1},Lockr.keys=function(){var keys=[],allKeys=Object.keys(localStorage);return 0===Lockr.prefix.length?allKeys:(allKeys.forEach(function(key){key.indexOf(Lockr.prefix)!==-1&&keys.push(key.replace(Lockr.prefix,""))}),keys)},Lockr.getAll=function(includeKeys){var keys=Lockr.keys();return includeKeys?keys.reduce(function(accum,key){var tempObj={};return tempObj[key]=Lockr.get(key),accum.push(tempObj),accum},[]):keys.map(function(key){return Lockr.get(key)})},Lockr.srem=function(key,value,options){var json,index,query_key=this._getPrefixedKey(key,options),values=Lockr.smembers(key,value);index=values.indexOf(value),index>-1&&values.splice(index,1),json=JSON.stringify({data:values});try{localStorage.setItem(query_key,json)}catch(e){console&&console.warn("Lockr couldn't remove the "+value+" from the set "+key)}},Lockr.rm=function(key){localStorage.removeItem(key)},Lockr.flush=function(){Lockr.prefix.length?Lockr.keys().forEach(function(key){localStorage.removeItem(Lockr._getPrefixedKey(key))}):localStorage.clear()},Lockr});

$( document ).ready(function() {  

    Lockr.prefix = '100mb';
    
    //fill faves with faves
    var faves = Lockr.get( '100mb_faves', [] );
    if( faves.length > 0 ) {
        for( var i in faves ) {
            $( '#faves-list .brief-list' ).append("<div class='row fave-item' id='"+faves[i]._id+"'><div class='thumbnail-img' style='background-image:url(" + faves[i].cover + ");'></div><div class='info'><p class='title'>"+faves[i].title+"</p><p class='author'>"+faves[i].author+", " +faves[i].year+"</p><a href='https://100millionbooks.org/snippet/?uid=" + faves[i].uid + "' target='_blank' class='perma'><i class='fa fa-link' aria-hidden='true'></i> Permalink</a></div><i class='fa fa-times remove-fave'></i></div>");
        }
    } else {
        $( '#faves-list .modal-body' ).append("<p class='nothing-yet'>No favorites yet.</p>");
    }
    
    //fill history with history
    var history = Lockr.get( '100mb_history', [] );
    if( history.length > 0 ) {
        for( var i in history ) {
            $( '#history-list .brief-list' ).append("<div class='row fave-item' id='"+history[i]._id+"'><div class='thumbnail-img' style='background-image:url(" + history[i].cover + ");'></div><div class='info'><p class='title'>"+history[i].title+"</p><p class='author'>"+history[i].author+", " +history[i].year+"</p><a href='https://100millionbooks.org/snippet/?uid=" + history[i].uid + "' target='_blank' class='perma'><i class='fa fa-link' aria-hidden='true'></i> Permalink</a></div></div>");                                        
        }
    } else {
        $( '#history-list .modal-body' ).append("<p class='nothing-yet'>No history yet.</p>");
    }
    

    /*******************************************************************
    
    pure dom-related stuff
    
    *******************************************************************/
    
    //adjust height for text in footer (because variable height)
    var about_height = $( '#about' ).height();
    $( '#about' ).css( 'margin-top', 'calc((20vh - ' + about_height + 'px) / 2)' );
    
    $( '#faves-list' ).on( 'click', '.remove-fave', function( o ) {
        removeFromLocalFaves( o.target.parentElement.id );
    });
    
    $( '.fave' ).on( 'click', function() {
        if( $(this).hasClass('faved') ) {
            $(this).removeClass('faved');
            cb = Lockr.get( '100mb_cached_books', [] );
            if( cb.length > 0 ) {
                removeFromLocalFaves( cb[0]._id );
            }
        } else {
            $(this).addClass('faved');
            cb = Lockr.get( '100mb_cached_books', [] );
            addToLocalFaves( cb[0] );
        } 
    });
    
    $( '.row.snippet-area, #faves-list .modal-body' ).on( 'click', '.amz, .gr, .lt', function() {
        
        var bo = "";
        var cl = $( this ).attr( 'class' );
        
        //which book
        if( $( this ).parent()[0].id == 'book-actions' ) {
            var cb = Lockr.get( '100mb_cached_books', [] );
            bo = cb[0]._id;
                $.getJSON( 'https://confidencehq.org/allthebooks/100mb-1m.php?bo=' + bo + '&cl=' + cl + '&callback=?' );
                $.getJSON( 'https://confidencehq.org/allthebooks/100mb-1m.php?bo=' + bo + '&cl=' + cl + '&callback=?' );
        } else {
            bo = $( this ).closest('.row.fave-item')[0].id;
            $.getJSON( 'https://confidencehq.org/allthebooks/100mb-1m.php?bo=' + bo + '&cl=' + cl + '&callback=?' );
        }
    });
    
    /*******************************************************************
    
    calculate time left for countdown
    
    *******************************************************************/
    
    function calc_time_left() {
        window.clearInterval();
        var t = 0; var diff = 0;
        var seconds = 6;
        
        var cb = Lockr.get( '100mb_cached_books', [] );
        
        t = Math.ceil( ( + new Date() ) / 1000 );
        diff = t - cb[0].timestamp;
        
        //console.log(seconds, t, cb[0].timestamp, t - cb[0].timestamp);
        
        set_the_interval( seconds - diff );
        
        return;
    }
    
    function set_the_interval( diff ) {
        window.setInterval( function() {
            if( diff < 1 ) {
                diff = 0;
            }
            
            $( '#time-left' ).text( new Date(diff * 1000).toISOString().substr(11, 8) );
            
            diff = diff - 1;
        }, 1000);
        
        return;
    }
    
    /*******************************************************************
    
    identify user so developer knows how many unique requests coming in (and identify spammers)
    
    *******************************************************************/
    
    function getRandomToken() {
        var randomPool = new Uint8Array(32);
        crypto.getRandomValues(randomPool);
        var hex = '';
        for (var i = 0; i < randomPool.length; ++i) {
            hex += randomPool[i].toString(16);
        }
        return hex;
    }

    var uid = Lockr.get( '100mb_userid', "" );
    if( uid ) {
        get_books( uid );
    } else {
        userid = getRandomToken();
        Lockr.set( '100mb_userid', userid );
        get_books( userid );
    }
    
    /******************************************************************/
    
    //check if new request being made within 9 seconds of last one (let folks catch the last book)   
    function get_books( userid ) {
        
        var new_array = [];
        var seconds = 6;    
        var cb = Lockr.get( '100mb_cached_books', [] )
            
        if( cb.length < 5 ) {
        
            load_items( userid, true );
            add_stumble();
    
        } else {    //means >0 items
            
            var t = Math.ceil( ( + new Date() ) / 1000 );
            
            if( ( t - cb[0].timestamp ) < seconds ) {
                mod_the_dom( cb[0] );
                calc_time_left();
            } else {
                
                var removed = {};
                removed = cb.shift();
                add_to_history( removed );
                
                cb[0].timestamp = Math.ceil( ( + new Date() ) / 1000 );
                
                Lockr.set( '100mb_cached_books', cb )
                
                mod_the_dom( cb[0] );
                calc_time_left();
                add_stumble();
                
                if( cb.length < 6 ) {
                    load_items( userid );
                }  
            }
        }
    }
    
    function load_items( uid, show = false ) {
        
        var alltogethernow = [];
        
        //check if last book was fetched within past 10 seconds
        $.getJSON( 'https://confidencehq.org/allthebooks/100mb-1m.php?uid=' + uid + '&callback=?' )
    
        .done( function( json ) {
            if( json ) {
                var transformed = transform_data( json );
                
                var cb = Lockr.get( '100mb_cached_books', [] );
                alltogethernow = cb.concat(transformed);
                    
                if( show ) {
                    alltogethernow[0].timestamp = Math.ceil( ( + new Date() ) / 1000 );
                }
                
                Lockr.set( '100mb_cached_books', alltogethernow );
                
                if( show ) {
                    mod_the_dom(alltogethernow[0]);
                    calc_time_left();
                }
            }
        })
               
        .fail( function( jqxhr, textStatus, error ) {
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
        });
    }
    
    
    function transform_data( json ) {
        
        for( var o in json ) {
                        
            if( json[o]['supersnip_text'] ) {
                json[o]['supersnip_text'] = ( json[o]['supersnip_text'] ).substring( 1, ( json[o]['supersnip_text'].length - 1 ) );
                
                if( json[o]['supersnip_text'] ===  "<p class='visual-quote'>If you're seeing this message, you're running an old version of the Chrome extension.<br><br>Please update!</p>" ) {
                    json[o]['supersnip_text'] = null;
                }
            }
            
            var year = json[o]['year'];
            
            if( year < 1500 ) {
                if( year < 0 ) {
                    year = Math.abs(year) + " BC";
                } else {
                    year = Math.abs(year) + " AD";
                }
            }
            
            json[o]['year'] = year;
        }
        
        return json;
    }
    
    function add_stumble() {
        
        var stumbles = Lockr.get( '100mb_number_stumbles', 0 );
        Lockr.set( '100mb_number_stumbles', stumbles + 1);
       
        return;
    }
    
    var stumbles = Lockr.get( '100mb_number_stumbles', 1 );
    $( ".top-right" ).append( "<p id='stumble-statement'>You've now stumbled upon <span class='stumble-stat' id='stumble-number'>"+stumbles+"</span> of all <br><span class='stumble-stat'>~100,000,000</span> books ever written!</p>" );
    //$( ".top-right" ).append( "<p id='stumble-statement'>Welcome to <span class='stumble-stat' id='stumble-number'>100 Million Books!</span> Discover a new book<br> every time you open a new tab. <a href='#'>Get it here</a>.</p>" );
    
    $( '#tab-options' ).on( 'click', '.disc-action.show-info', function() {
        //show info
        $( '#book-snippet' ).fadeOut( 150, function() {
            $( '#book-info' ).fadeIn( 150 );
        });
        
        $( '#book-actions' ).fadeOut();
        $( '#book-tags' ).fadeIn();

        $( '#tab-options' ).html( '<div class="info-note"><p class="disc-action-note">Show Quote</p><i class="fa fa-quote-left disc-action show-quote" aria-hidden="true"></i></div>' );
    });
    
    $( '#tab-options' ).on( 'click', '.disc-action.show-quote', function() {
        $( '#book-info' ).fadeOut( 150, function() {
            $( '#book-snippet' ).fadeIn( 150 );
        });

        $( '#book-tags' ).fadeOut();
        $( '#book-actions' ).fadeIn();
        
        $( '#tab-options' ).html( '<div class="info-note"><p class="disc-action-note">Show Description</p><i class="fa fa-info-circle disc-action show-info" aria-hidden="true"></i></div>' );
    });
    

    function mod_the_dom( book ) {
        
        var stumbles = Lockr.get( '100mb_number_stumbles', 1 );
        $( '#stumble-number' ).text( stumbles );
        
        $( '#book-title' ).text( book.title );
        $( '#book-author' ).text( book.author );
        $( '#book-year' ).text( book.year );
                    
        $( '#book-img' ).attr( 'src', book.cover_picture );
        
        if( book.supersnip_text ) {
            $( '#book-snippet' ).html( '<i class="fa fa-quote-left watermark" aria-hidden="true"></i><i class="fa fa-quote-right watermark" aria-hidden="true"></i>' + book.supersnip_text );
            
            if( book.description ) {
                $( '#book-info' ).html( book.description );
            }
            
            if( book.supersnip_text && book.description ) {
                $( '#tab-options' ).html( '<div class="info-note"><p class="disc-action-note">Show Description</p><i class="fa fa-info-circle disc-action show-info" aria-hidden="true"></i></div>' );
            } 
            
        } else {
            $( '#book-info' ).html( book.description );
            $( '#book-snippet' ).remove();
            $( '#book-info' ).show();
            
            $( '#tab-options' ).html( '<div class="info-note"><p class="disc-action-note">No quote yet. Know one? Add one!</p><a href="https://docs.google.com/forms/d/e/1FAIpQLScvfBPULpD8VOqCYjQazj7M-4amEbtdTgpc2AD6joguGi3S_w/viewform?usp=sf_link" target="_blank"><i class="fa fa-plus-circle disc-action" aria-hidden="true"></i></a></div>' );
        }
        
        if( book.suggested_by_name ) {
            var sugg_text = "";
            if( book.suggested_by_link ) {
                var hostname = getDomain( book.suggested_by_link );
                sugg_text = "Suggested by <img src='https://www.google.com/s2/favicons?domain="+hostname+"'> <a href='"+book.suggested_by_link+"' target='_blank'> " +book.suggested_by_name+"</a>";
            } else { 
                sugg_text = "Suggested by " + book.suggested_by_name;
            }
            $( '#suggestion-credit' ).css( 'padding', '2px 6px' );
            $( '#suggestion-credit' ).html( sugg_text );
        }
        
        if( parseInt( book.featured ) ) {
            var sugg_text = "Featured <i class='fa fa-question-circle'></i>";
            $( '#suggestion-credit' ).css( 'padding', '2px 6px' );
            $( '#suggestion-credit' ).html( sugg_text );
        }
        
        var skeleton = "<div id='book-actions'>"; 

        skeleton += "<a class='perma' data-toggle=tooltip' data-placement='top' title='Use this link to share!' href='https://100millionbooks.org/snippet/?uid=" + book.uid + "' target='_blank'><i class='fa fa-link'></i> Share this</a><br>";
        
        if( book.asin ) {
            skeleton += "<a class='amz' href='https://www.amazon.com/dp/"+book.asin+"' target='_blank'>Amazon</a>"
            skeleton += "<a class='gr' href='https://www.goodreads.com/book/isbn/"+book.asin+"' target='_blank'>Goodreads</a>"
        } 
            
        skeleton += "</div>"
        $( '.coverImage' ).after( skeleton );

        //add tags
        var tags_html = "<div id='book-tags'>";
        var tags_arr = [];
        if( book.tags ) {
            tags_arr = ( book.tags ).split( ',' );
        }
        for( var t in tags_arr ) {
            tags_html += "<span>" + tags_arr[t] + "</span>";
        }
        tags_html += "</div>";
        $( '.coverImage' ).after( tags_html );
        
        $( '.pre-load' ).fadeOut( 400, function() {
            $( '.pre-load' ).remove();
            $( '.post-load' ).fadeIn();
        });
        
        return;
    }
    
    function getDomain(url, subdomain) {
        subdomain = subdomain || false;

        url = url.replace(/(https?:\/\/)?(www.)?/i, '');

        if (!subdomain) {
            url = url.split('.');

            url = url.slice(url.length - 2).join('.');
        }

        if (url.indexOf('/') !== -1) {
            return url.split('/')[0];
        }

        return url;
    }
    
    //add element to history
    function add_to_history( current_item ) {
        
        var new_item = {
            _id: current_item._id,
            title: current_item.title,
            author: current_item.author,
            year: current_item.year,
            cover: current_item.cover_picture,
            uid: current_item.uid,
        }
        
        var history = Lockr.get( '100mb_history', [] );
            
        history.unshift( new_item );

        if( history.length > 20 ) {
            history.pop();
        }

        Lockr.set( '100mb_history', history );

        //update dom
        $( '#history-list .modal-body .nothing-yet' ).remove();
        $( '#history-list .brief-list' ).prepend("<div class='row fave-item' id='"+current_item._id+"'><div class='thumbnail-img' style='background-image:url(" + current_item.cover_picture + ");'></div><div class='info'><p class='title'>"+current_item.title+"</p><p class='author'>"+current_item.author+", " +current_item.year+"</p><a href='https://100millionbooks.org/snippet/?uid=" + current_item.uid + "' target='_blank' class='perma'><i class='fa fa-link' aria-hidden='true'></i> Permalink</a></div></div>");
        
    }
    
    //add element to favorites
    function addToLocalFaves( current_item ) {
        
        var new_fave = {
            _id: current_item._id,
            title: current_item.title,
            author: current_item.author,
            year: current_item.year,
            cover: current_item.cover_picture,
            asin: current_item.asin,
            isbn10:  current_item.isbn10,
            uid: current_item.uid
        }
               
        var cb = Lockr.get( '100mb_cached_books', [] );
        var faves = Lockr.get( '100mb_faves', [] );
        
        for( var i in faves ) {
            if( new_fave._id == faves[i]._id ) { 
                return;
            }
        }
        
        faves.unshift( new_fave );
        Lockr.set( '100mb_faves', faves );
        
        //update dom
        $( '#faves-list .modal-body .nothing-yet' ).remove();
        
        $( '#faves-list .brief-list' ).prepend("<div class='row fave-item' id='"+current_item._id+"'><div class='thumbnail-img' style='background-image:url(" + current_item.cover_picture + ");'></div><div class='info'><p class='title'>"+current_item.title+"</p><p class='author'>"+current_item.author+", " +current_item.year+"</p><a href='https://100millionbooks.org/snippet/?uid=" + current_item.uid + "' target='_blank' class='perma'><i class='fa fa-link' aria-hidden='true'></i> Permalink</a></div><i class='fa fa-times remove-fave'></i></div>");
        
        $.getJSON( 'https://confidencehq.org/allthebooks/100mb-1m.php?bo=' + cb[0]._id + '&cl=local_saves' + '&callback=?' );
        
    }
    
    function removeFromLocalFaves( uid ) {
        
        var faves = Lockr.get( '100mb_faves', [] );
        
        for( var o in faves ) {
            if( faves[o]['_id'] == uid ) {
                faves.splice(o, 1);
            }
        }
        
        Lockr.set( '100mb_faves', faves );
           
        //update dom
        if( ( faves ).length == 0 ) {
            $( '#faves-list .modal-body' ).append("<p class='nothing-yet'>No favorites yet.</p>");
        }
        
        $( '#' + uid ).remove();
        $( '.fave' ).removeClass( 'faved' );
    }
    
});