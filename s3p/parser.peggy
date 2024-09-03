start = anything
anything = ( text / prompt / code )+

text "writing" = letters:[-a-zA-Z_ ,!?.\n\r]+                 { return letters.join(""); }

prompt = responses:response+ endprompt                 { return ({ responses })}
bang = "*"
response = bang anything 
endprompt = "*" " "* "*"                                              { return "**"; }

code = did / didnt / if / unless
did =    op:"[did "i    " "* match:text "]" wrap:anything "[/did]"i       { return ({op:'did'   , match, wrap})}
didnt =  op:"[didnt "i  " "* match:text "]" wrap:anything "[/didnt]"i     { return ({op:'didnt' , match, wrap})}
if =     op:"[if "i     " "* match:text "]" wrap:anything "[/if]"i        { return ({op:'if'    , match, wrap})}
unless = op:"[unless "i " "* match:text "]" wrap:anything "[/unless]"i    { return ({op:'unless', match, wrap})}
iff =    op:"["i        " "* match:text "]" wrap:anything "[/]"i          { return ({op:'if'    , match, wrap})}
