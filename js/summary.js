// Summary section for Avatar: The Last Airbender analysis
(function() {
    const summaryContainer = document.getElementById("summary");
    if (!summaryContainer) return;

    const summaryHTML = `
        <div style="max-width: 1400px; margin: 0 auto; padding: 0 24px 0 24px; text-align: center;">
            <div style="display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 10px;">
                <div style="flex: 1; max-width: 450px; height: 1px; background-color: rgb(90 62 34 / 40%);"></div>
                <span style="font-size: 24px; color: rgb(90 62 34 / 60%); white-space: nowrap;">𖥸</span>
                <div style="flex: 1; max-width: 450px; height: 1px; background-color: rgb(90 62 34 / 40%);"></div>
            </div>
            <h2 style="font-family: 'Uncial Antiqua', cursive; font-size: 28px; color: #5a3e22; letter-spacing: 0.06em; margin-bottom: 24px;">
                Understanding Avatar Through Data
            </h2>
            
            <div style="text-align: left; line-height: 1.8; color: #5a3e22; font-family: 'Philosopher', serif; font-size: 15px;">
                <p style="margin-bottom: 16px;">
                    <strong>Avatar: The Last Airbender</strong> has captivated millions since 2005, but what makes it transcend its animated medium and resonate so powerfully with audiences? By examining the show's data—from the geography of conflicts to the moral arcs of characters to the thematic undercurrents that drive the narrative—we discover that its success lies in a meticulously constructed balance of storytelling elements.
                </p>

                <p style="margin-bottom: 16px;">
                    These visualizations tell Avatar's complete story: The nations and elements establish the world's foundation, with each culture embodying distinct values. The battle locations reveal where conflicts concentrate across the world. The character network and bending rings show how central figures like Aang, Katara, and Zuko develop through elemental mastery and repeated encounters. The moral ring tracks their ethical evolution—proving characters transcend their birth and grow through choice. Finally, the themes timeline reveals the true architecture: Four interwoven themes—<span style="color: #b84e10;">War</span> establishing conflict, <span style="color: #6a8a9c;">Balance</span> offering solution, <span style="color: #235e8c;">Destiny</span> challenging agency, and <span style="color: #4a6a22;">Redemption</span> enabling transformation—drive the entire narrative forward.
                </p>

                <p style="margin-bottom: 24px;">
                    What these visualizations ultimately reveal is that Avatar: The Last Airbender works because it refuses simple answers. Characters are shaped by nations and elements, birth and destiny—but they transcend these limitations through choice and growth. This is why the show transcends its target audience of children: it teaches that complexity is richer than simplicity, that people contain multitudes, and that redemption is always possible. The data doesn't create these themes—it illuminates them, revealing the careful architecture of storytelling that has made Avatar one of the most beloved narratives of our time.
                </p>

                <div style="display: flex; justify-content: center; align-items: center; gap: 24px; flex-wrap: wrap; margin-bottom: 0; margin-top: 60px;">
                    <div style="font-size: 12px; color: rgb(90 62 34 / 70%); line-height: 1.6; margin: 0; padding-bottom: 0; text-align: left; flex: 0 0 auto; position: absolute; left: 24px;">
                        <strong>Data Source:</strong> <a href="https://www.kaggle.com/datasets/ekrembayar/avatar-the-last-air-bender?select=avatar.csv" target="_blank" style="color: #235e8c; text-decoration: none; border-bottom: 1px solid #235e8c;">Avatar: The Last Airbender on Kaggle</a>
                    </div>

                    <div style="display: flex; justify-content: center; gap: 12px; flex: 0 0 auto;">
                        <div style="text-align: center;">
                            <img src="/img/water.png" alt="Water" style="width: 65px; height: auto;">
                        </div>
                        <div style="text-align: center;">
                            <img src="/img/earth.png" alt="Earth" style="width: 65px; height: auto;">
                        </div>
                        <div style="text-align: center;">
                            <img src="/img/fire.png" alt="Fire" style="width: 65px; height: auto;">
                        </div>
                        <div style="text-align: center;">
                            <img src="/img/air.png" alt="Air" style="width: 65px; height: auto;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    summaryContainer.innerHTML = summaryHTML;
})();
