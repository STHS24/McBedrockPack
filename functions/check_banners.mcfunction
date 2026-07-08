# ========================================================
# CHUNK LOADER AUTOMÁTICO (PREVINE BUG DE DISTÂNCIA)
# ========================================================
# Sempre que o suporte "banner_purple" existir com o banner, ele cria ou atualiza uma Ticking Area ao redor de si mesmo (raio de 1 chunk).
# O parâmetro 'true' no final força o "preload" (carrega mesmo se o servidor for reiniciado).
execute at @e[type=armor_stand,name="t1a",hasitem={item=banner,data=5,location=slot.weapon.mainhand}] run tickingarea add circle ~ ~ ~ 1 t1_chunk true

# ========================================================
# EFEITO AUTOMÁTICO DOS SUPORTES
# ========================================================
effect @e[type=armor_stand,name="t1a",hasitem={item=banner,data=5,location=slot.weapon.mainhand}] resistance 2 1 false


# ========================================================
# MONITORAMENTO DE ROUBO / RECUPERAÇÃO
# ========================================================

# --- TIME ROXO ---
# --- CONTROLE DO CRONÔMETRO DE ROUBO ---

# Se o banner SUMIU: Adiciona 1 tick ao cronômetro do time 't1' (Roda 20x por segundo)
execute unless entity @e[type=armor_stand,name="t1a",hasitem={item=banner,data=5,location=slot.weapon.mainhand}] run scoreboard players add t1 pvp_timer 1

# Se o banner VOLTOU: Reseta o cronômetro do time 't1' para zero e limpa os debuffs
execute if entity @e[type=armor_stand,name="t1a",hasitem={item=banner,data=5,location=slot.weapon.mainhand}] run scoreboard players set t1 pvp_timer 0
execute if entity @e[type=armor_stand,name="t1a",hasitem={item=banner,data=5,location=slot.weapon.mainhand}] run execute as @a[tag=t1] run function t1Off
