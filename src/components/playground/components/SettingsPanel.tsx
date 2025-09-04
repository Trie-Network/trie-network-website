import { Slider } from '../UIComponents';

interface SettingsPanelProps {
    temperature: number;
    maxTokens: number;
    topP: number;
    onTemperatureChange: (value: number) => void;
    onMaxTokensChange: (value: number) => void;
    onTopPChange: (value: number) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
    temperature,
    maxTokens,
    topP,
    onTemperatureChange,
    onMaxTokensChange,
    onTopPChange
}) => (
    <div className="space-y-6">
        <div>
            <h3 className="font-medium mb-3 text-slate-800">Temperature</h3>
            <Slider
                value={temperature}
                onChange={(e) => onTemperatureChange(parseFloat(e.target.value))}
                min={0}
                max={1}
                step={0.01}
                displayValue={temperature.toFixed(1)}
            />
            <p className="text-xs text-primary-hover mt-2">
                Higher values produce more creative outputs
            </p>
        </div>

        <div>
            <h3 className="font-medium mb-3 text-slate-800">Max Tokens</h3>
            <div className="flex items-center">
                <Slider
                    displayValue={maxTokens}
                    value={maxTokens}
                    onChange={(e) => onMaxTokensChange(parseInt(e.target.value))}
                    min={1}
                    max={10000}
                    step={1}
                    className="flex-1"
                />
            </div>
            <p className="text-xs text-primary-hover mt-2">
                Maximum length of generated text
            </p>
        </div>

        <div>
            <h3 className="font-medium mb-3 text-slate-800">Top-P</h3>
            <Slider
                value={topP}
                onChange={(e) => onTopPChange(parseFloat(e.target.value))}
                min={0}
                max={1}
                step={0.01}
                displayValue={topP.toFixed(1)}
            />
            <p className="text-xs text-primary-hover mt-2">
                Controls diversity via nucleus sampling
            </p>
        </div>
    </div>
);

