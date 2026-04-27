start = anything
anything     = ( escaped / code / hashtag / prompt / loneresponse / text )+
anythingelse = ( escaped / code / hashtag / text  )+

_ = [ \t]*

text    =     letters:[^\*\[\]\#\\]+                                         { return letters.join(""); }
escaped = "\\" letters:[\*\[\]\#\\]                                          { return letters; }
hashtag = "#" tag:[-A-Za-z0-9']+                                             { return ({op:'hashtag', tag: "#"+tag.join("")})}

bang = "*"
endprompt = bang _ bang
prompt = responses:response+  endprompt                                      { return ({op:'menu', responses})}
response = _ bang option:anythingelse                                        { return option; }
loneresponse = _ bang option:anythingelse                                    { return ({op:'*', option})}

code = did / didnt / if / unless / menu / plot / goto
did =    "[did "i    _ match:text "]"      wrap:anything     "[/did]"i       { return ({op:'did'   , match, wrap})}
didnt =  "[didnt "i  _ match:text "]"      wrap:anything     "[/didnt]"i     { return ({op:'didnt' , match, wrap})}
if =     "[if "i     _ match:text "]"      wrap:anything     "[/if]"i        { return ({op:'if'    , match, wrap})}
unless = "[unless "i _ match:text "]"      wrap:anything     "[/unless]"i    { return ({op:'unless', match, wrap})}
menu =   "[menu"i    _ name:text? "]" responses:response+    "[/menu]"i      { return ({op:'menu'  , name, responses})}
plot =   "[plot "i   _ match:text "]"                                        { return ({op:'plot'  , match})}
goto =   "[goto "i   _ match:text "]"                                        { return ({op:'goto'  , match})}
