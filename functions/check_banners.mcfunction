# ========================================================
# EFEITO AUTOMÁTICO DOS SUPORTES
# ========================================================
effect @e[type=armor_stand,name="t1a",hasitem={item=banner,data=5,location=slot.weapon.mainhand}] resistance 2 1 false


# ========================================================
# MONITORAMENTO DE ROUBO / RECUPERAÇÃO
# ========================================================

# --- TIME ROXO ---
execute unless entity @e[type=armor_stand,name="t1a",hasitem={item=banner,data=5,location=slot.weapon.mainhand}] run execute as @a[tag=t1] run function t1F1
execute if entity @e[type=armor_stand,name="t1a",hasitem={item=banner,data=5,location=slot.weapon.mainhand}] run execute as @a[tag=t1] run function t1Off
