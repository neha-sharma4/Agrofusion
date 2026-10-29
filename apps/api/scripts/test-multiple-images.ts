import fs from 'node:fs';
import path from 'node:path';
import { diseaseAssessmentService } from '../src/services/disease/DiseaseAssessmentService.js';

async function runTest() {
  console.log('Testing Disease Detection on multiple image files...');
  const uploadsDir = path.resolve(process.cwd(), 'uploads');

  // Select 3 distinct images from uploads
  const testImages = [
    '02b2313a-e80d-4604-9962-bc377e8c7ecf.png',
    '19d9c3b6-23d7-4875-afa6-8aa741d15017.jpg',
    '402dc207-897b-4ad2-9ed7-5f24129586c5.png',
  ];

  for (const filename of testImages) {
    const fullPath = path.join(uploadsDir, filename);
    if (!fs.existsSync(fullPath)) {
      console.log(`Skipping missing file: ${filename}`);
      continue;
    }

    console.log(`\n========================================`);
    console.log(`Testing Image: ${filename}`);
    console.log(`========================================`);

    try {
      const mimeType = filename.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
      const fileBuffer = fs.readFileSync(fullPath);
      const imageBase64 = fileBuffer.toString('base64');

      const result = await diseaseAssessmentService.assess({
        userId: 'test-user',
        cropCycleId: 'test-cycle',
        cropName: 'Cotton',
        soilName: 'Black Soil',
        regionName: 'Central Plateau and Hills',
        imageBase64,
        mimeType,
        imageKey: filename,
      });

      console.log('Diagnosis Status:', result.status);
      console.log('Identified Crop:', result.identified_crop);
      console.log('Crop Match:', result.crop_match);
      console.log('Disease Name:', result.disease_common_name);
      console.log('Confidence:', result.confidence);
      console.log('Risk Level:', result.risk_level);
      console.log('Symptoms Count:', result.visible_symptoms?.length || 0);
      console.log('Symptoms Preview:', result.visible_symptoms?.slice(0, 2));
      console.log('Probable Cause:', result.probable_cause);
      console.log('Consequences:', result.consequences_if_untreated);
      console.log('Precautions Count:', result.precautions?.length || 0);
      console.log('Has Treatment:', !!result.treatment);
      if (result.treatment) {
        console.log('Treatment Medicine:', result.treatment.medicine_name);
        console.log('Treatment Dosage:', result.treatment.dosage);
      }
      console.log('Message:', result.message);
    } catch (err) {
      console.error(`Error analyzing ${filename}:`, err);
    }
  }
}

runTest();

