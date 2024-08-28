start = ( text / prompt / code )+
text = letters:[-a-zA-Z_ ,!?.]+ { return letters.join(""); }
endprompt = "*" " "* "*" { return "**"; }
bang = "*"
response = bang text 
prompt = responses:response+ endprompt { return ({ responses })}
code = "[" instruction "]"
instruction = ( "did " / "didnt " ) " "* text
