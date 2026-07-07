# Remove as fases ativas do respectivo time
tag @a[tag=limpar_debuff,tag=team_red] remove red_1
tag @a[tag=limpar_debuff,tag=team_red] remove red_2
tag @a[tag=limpar_debuff,tag=team_red] remove red_3

tag @a[tag=limpar_debuff,tag=team_blue] remove blue_1
tag @a[tag=limpar_debuff,tag=team_blue] remove blue_2
tag @a[tag=limpar_debuff,tag=team_blue] remove blue_3

tag @a[tag=limpar_debuff,tag=team_green] remove green_1
tag @a[tag=limpar_debuff,tag=team_green] remove green_2
tag @a[tag=limpar_debuff,tag=team_green] remove green_3

tag @a[tag=limpar_debuff,tag=team_yellow] remove yellow_1
tag @a[tag=limpar_debuff,tag=team_yellow] remove yellow_2
tag @a[tag=limpar_debuff,tag=team_yellow] remove yellow_3

tag @a[tag=limpar_debuff,tag=team_purple] remove purple_1
tag @a[tag=limpar_debuff,tag=team_purple] remove purple_2
tag @a[tag=limpar_debuff,tag=team_purple] remove purple_3

# Restaura a tag de baseline nivel 0
tag @a[tag=limpar_debuff,tag=team_red] add red_0
tag @a[tag=limpar_debuff,tag=team_blue] add blue_0
tag @a[tag=limpar_debuff,tag=team_green] add green_0
tag @a[tag=limpar_debuff,tag=team_yellow] add yellow_0
tag @a[tag=limpar_debuff,tag=team_purple] add purple_0

# Limpa a tag de controle temporaria
tag @a[tag=limpar_debuff] remove limpar_debuff
