start = anything
anything = ( text / prompt / code )+
anythingelse = ( text / code )+

text "writing" = letters:[-a-zA-Z_ ,!?.\n\r]+                 { return letters.join(""); }

prompt = responses:response+                   { return ({ responses })}
bang = "*"
response = endprompt / ( bang anythingelse )
endprompt = "*" " "* "*"                                              { return "**"; }

code = did / didnt / if / unless
did =    "[did "i    " "* match:text "]" wrap:anything "[/did]"i       { return ({op:'did'   , match, wrap})}
didnt =  "[didnt "i  " "* match:text "]" wrap:anything "[/didnt]"i     { return ({op:'didnt' , match, wrap})}
if =     "[if "i     " "* match:text "]" wrap:anything "[/if]"i        { return ({op:'if'    , match, wrap})}
unless = "[unless "i " "* match:text "]" wrap:anything "[/unless]"i    { return ({op:'unless', match, wrap})}
iff =    "["i        " "* match:text "]" wrap:anything "[/]"i          { return ({op:'if'    , match, wrap})}
