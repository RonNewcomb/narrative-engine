start = anything
anything = ( text / prompt / code )+
anythingelse = ( text / code )+

_ = [ \t]*

text "writing" = letters:[-a-zA-Z_ ,!?.\n\r]+                 { return letters.join(""); }

prompt = responses:response+                                        { return ({op:'menu', responses})}
bang = "*"
endprompt = bang _ bang                                             { return 0;} 
response = endprompt / ( bang option:anythingelse                   { return option; }     )                 

code = did / didnt / if / unless
did =    "[did "i    _ match:text "]" wrap:anything "[/did]"i       { return ({op:'did'   , match, wrap})}
didnt =  "[didnt "i  _ match:text "]" wrap:anything "[/didnt]"i     { return ({op:'didnt' , match, wrap})}
if =     "[if "i     _ match:text "]" wrap:anything "[/if]"i        { return ({op:'if'    , match, wrap})}
unless = "[unless "i _ match:text "]" wrap:anything "[/unless]"i    { return ({op:'unless', match, wrap})}
menu =   "[menu "i   _ "]" responses:anything "[/menu]"i            { return ({op:'menu'  , responses})}
