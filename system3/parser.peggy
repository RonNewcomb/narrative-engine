start = anything
anything = ( text / prompt / code / hashtag )+
anythingelse = ( text / code / hashtag )+

_ = [ \t]*

text    = letters:[^\*\[\]\#]+                      { return letters.join(""); }
hashtag = "#" tag:[-A-Za-z0-9']+                { return ({op:'hashtag', tag: "#"+tag.join("")}); }

prompt = responses:response+                                        { return ({op:'menu', responses})}
bang = "*"
endprompt = bang _ bang                                             { return 0;} 
subresponse = _ bang option:anythingelse                              { return option; }     
response = endprompt / subresponse


code = did / didnt / if / unless / menu
did =    "[did "i    _ match:text "]" wrap:anything "[/did]"i       { return ({op:'did'   , match, wrap})}
didnt =  "[didnt "i  _ match:text "]" wrap:anything "[/didnt]"i     { return ({op:'didnt' , match, wrap})}
if =     "[if "i     _ match:text "]" wrap:anything "[/if]"i        { return ({op:'if'    , match, wrap})}
unless = "[unless "i _ match:text "]" wrap:anything "[/unless]"i    { return ({op:'unless', match, wrap})}
menu =   "[menu"i    _ "]" responses:subresponse+   "[/menu]"i      { return ({op:'menu'  , responses})}
