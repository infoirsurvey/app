
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
      projectId: "ir-survey-fc9d7"
  });
}

const db = admin.firestore();

async function initMasterData() {
  const parties = [
    { name: 'INC', symbol: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Indian_National_Congress_hand_symbol.svg/1200px-Indian_National_Congress_hand_symbol.svg.png' },
    { name: 'BJP', symbol: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Bharatiya_Janata_Party_logo.svg/1200px-Bharatiya_Janata_Party_logo.svg.png' },
    { name: 'BRS', symbol: '' },
    { name: 'AIMIM', symbol: '' },
    { name: 'TDP', symbol: '' },
    { name: 'JSP', symbol: '' },
    { name: 'YSRCP', symbol: '' },
    { name: 'Others', symbol: '' }
  ];

  console.log('Initializing Parties...');
  for (const party of parties) {
    await db.collection('parties').add(party);
  }

  const states = [
    { name: 'Telangana', level: 'STATE', parentId: null },
    { name: 'Andhra Pradesh', level: 'STATE', parentId: null }
  ];

  console.log('Initializing States...');
  for (const state of states) {
    const stateRef = await db.collection('locations').add(state);

    if (state.name === 'Telangana') {
        const districts = ['Hyderabad', 'Rangareddy', 'Medchal-Malkajgiri'];
        for (const dist of districts) {
            await db.collection('locations').add({
                name: dist,
                level: 'DISTRICT',
                parentId: stateRef.id
            });
        }
    }
  }

  console.log('Master data initialization complete.');
}

initMasterData().catch(console.error);
