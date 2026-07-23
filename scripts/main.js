import { world, system, ItemStack } from "@minecraft/server";

// ==========================================
// 1. CONFIGURAÇÃO DOS TIMES E BANDEIRAS
// ==========================================
const TEAM_BANNERS = [
    { bannerName: "§cRed Team Flag", teamTag: "time_red" },
    { bannerName: "§9Blue Team Flag", teamTag: "time_blue" },
    { bannerName: "§aGreen Team Flag", teamTag: "time_green" }
];

// VALORES AJUSTADOS PARA TESTE RÁPIDO (Em minutos reais):
const MINUTES_FOR_PHASE_2 = 0.5; // 30 segundos para testes (Mude para 20 depois)
const MINUTES_FOR_PHASE_3 = 1.0; // 60 segundos para testes (Mude para 140 depois)

const CHECK_INTERVAL = 20; // Checa tudo a cada 1 segundo (20 ticks)

const teamLossTimers = {
    time_red: 0, time_blue: 0, time_green: 0
};

// ==========================================
// 2. SISTEMA DE COLOCAÇÃO E QUEBRA (PRESERVAR NOMES)
// ==========================================

world.afterEvents.playerPlaceBlock.subscribe((event) => {
    const player = event.player;
    const block = event.block;
    
    if (block.typeId.includes("banner")) {
        const inventory = player.getComponent("minecraft:inventory");
        const item = inventory.container.getItem(player.selectedSlotIndex);

        if (item && item.nameTag && item.nameTag.includes("§")) {
            const dimension = world.getDimension(player.dimension.id);
            const anchor = dimension.spawnEntity("minecraft:interaction", {
                x: block.location.x + 0.5, y: block.location.y, z: block.location.z + 0.5
            });
            anchor.addTag("SpecialBannerAnchor");
            anchor.setDynamicProperty("saved_name", item.nameTag);
            
            // DEBUG: Confirmação de posicionamento
            player.sendMessage(`§e[DEBUG] Âncora criada para a bandeira: ${item.nameTag} em X:${block.location.x} Y:${block.location.y} Z:${block.location.z}`);
        }
    }
});

world.beforeEvents.playerBreakBlock.subscribe((event) => {
    const player = event.player;
    const block = event.block;
    const dimension = world.getDimension(player.dimension.id);

    if (block.typeId.includes("banner")) {
        const anchors = dimension.getEntities({
            type: "minecraft:interaction",
            tags: ["SpecialBannerAnchor"],
            location: { x: block.location.x + 0.5, y: block.location.y, z: block.location.z + 0.5 },
            maxDistance: 0.6
        });

        if (anchors.length > 0) {
            const anchor = anchors[0];
            const savedName = anchor.getDynamicProperty("saved_name");
            event.cancel = true; 

            system.run(() => {
                block.setType("minecraft:air");
                const inventory = player.getComponent("minecraft:inventory");
                const newItem = new ItemStack(block.typeId, 1);
                newItem.nameTag = savedName;
                inventory.container.addItem(newItem);
                
                // DEBUG: Confirmação de quebra segura
                player.sendMessage(`§e[DEBUG] Bloco interceptado! Devolvendo item nomeado: ${savedName}`);
                anchor.remove();
            });
        }
    }
});

// ==========================================
// 3. RASTREAMENTO, CRONÔMETRO E DEBUFFS POR FASE
// ==========================================

system.runInterval(() => {
    const teamHasLostBanner = {
        time_red: false, time_blue: false, time_green: false
    };

    // 1. Escaneia inventários
    for (const player of world.getAllPlayers()) {
        const inventory = player.getComponent("minecraft:inventory");
        if (!inventory || !inventory.container) continue;

        for (let i = 0; i < inventory.container.size; i++) {
            const item = inventory.container.getItem(i);
            if (item && item.typeId.includes("banner") && item.nameTag) {
                const matchedBanner = TEAM_BANNERS.find(b => b.bannerName === item.nameTag);
                if (matchedBanner) {
                    const isOwnerOfBanner = player.hasTag(matchedBanner.teamTag);
                    
                    // DEBUG: Mostra no chat quem está segurando qual bandeira
                    player.sendMessage(`§7[DEBUG] ${player.name} está segurando a bandeira [${item.nameTag}]. Dono legítimo? ${isOwnerOfBanner}`);

                    if (!isOwnerOfBanner) {
                        teamHasLostBanner[matchedBanner.teamTag] = true;
                    }
                }
            }
        }
    }

    // 2. Processa o tempo e aplica os debuffs
    for (const config of TEAM_BANNERS) {
        const currentTeamTag = config.teamTag;
        const isCurrentlyLost = teamHasLostBanner[currentTeamTag];
        const teamPlayers = world.getAllPlayers().filter(p => p.hasTag(currentTeamTag));

        if (isCurrentlyLost) {
            teamLossTimers[currentTeamTag] += 1;
            const minutesElapsed = teamLossTimers[currentTeamTag] / 60;
            const secondsElapsed = teamLossTimers[currentTeamTag]; // Contador visual em segundos

            let currentPhase = 1;
            if (minutesElapsed >= MINUTES_FOR_PHASE_3) {
                currentPhase = 3;
            } else if (minutesElapsed >= MINUTES_FOR_PHASE_2) {
                currentPhase = 2;
            }

            // DEBUG: Alerta de tempo correndo enviado para o chat do console/jogador ativo
            for (const p of world.getAllPlayers()) {
                p.sendMessage(`§e[DEBUG CLOCK] Time [${currentTeamTag}] sem bandeira por: ${secondsElapsed}s (Fase Ativa: ${currentPhase})`);
            }

            for (const player of teamPlayers) {
                updatePhaseTags(player, currentPhase);

                if (currentPhase === 1) {
                    player.runCommandAsync("effect @s weakness 2 0 true");
                } 
                else if (currentPhase === 2) {
                    player.runCommandAsync("effect @s weakness 2 0 true");
                    player.runCommandAsync("effect @s slowness 2 0 true");
                } 
                else if (currentPhase === 3) {
                    player.runCommandAsync("effect @s weakness 2 0 true");
                    player.runCommandAsync("effect @s slowness 2 0 true");
                    player.runCommandAsync("effect @s hunger 2 0 true");
                }
            }
        } else {
            if (teamLossTimers[currentTeamTag] > 0) {
                teamLossTimers[currentTeamTag] = 0;
                for (const player of teamPlayers) {
                    clearAllPhaseTags(player);
                    player.sendMessage("§aSua bandeira foi protegida! Todos os cronômetros e debuffs foram zerados.");
                }
            }
        }
    }
}, CHECK_INTERVAL);

function updatePhaseTags(player, phase) {
    const targetTag = `debuff_stage_${phase}`;
    if (!player.hasTag(targetTag)) {
        clearAllPhaseTags(player);
        player.addTag(targetTag);
        player.sendMessage(`§cAlerta! O debuff do seu time progrediu para a §lFase ${phase}§r§c.`);
    }
}

function clearAllPhaseTags(player) {
    if (player.hasTag("debuff_stage_1")) player.removeTag("debuff_stage_1");
    if (player.hasTag("debuff_stage_2")) player.removeTag("debuff_stage_2");
    if (player.hasTag("debuff_stage_3")) player.removeTag("debuff_stage_3");
}
